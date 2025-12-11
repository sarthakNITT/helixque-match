import { BuildSignature } from "../../utils/buildSignature";

function required(name: string) {
  throw new Error(`${name} dependency required (pass via deps)`);
}

export async function strictJoin(
  userId: string,
  prefs: any,
  deps?: {
    redis?: {
      getUserState?: (s: string) => Promise<any>;
      saveUserState?: (s: string, o: any) => Promise<void>;
      atomicPopFromStrictQueue?: (sig: string) => Promise<string | null>;
      addToStrictQueue?: (
        sig: string,
        u: string,
        score?: number
      ) => Promise<void>;
      removeFromStrictQueue?: (sig: string, u: string) => Promise<void>;
      addToWaitingSet?: (mode: string, u: string) => Promise<void>;
      removeFromWaitingSet?: (mode: string, u: string) => Promise<void>;
      acquireLock?: (
        u: string,
        token: string,
        ttlMs?: number
      ) => Promise<boolean>;
      releaseLock?: (u: string, token: string) => Promise<boolean>;
      getQualityScore?: (u: string) => Promise<number>;
    };
    prisma?: {
      createSession?: (
        a: string,
        b: string,
        mode: string,
        prefsA: any,
        prefsB: any
      ) => Promise<any>;
    };
  }
): Promise<{ status: "queued" } | { status: "matched"; session: any }> {
  const redis = deps?.redis ?? (required("redis") as any);
  const prisma = deps?.prisma ?? (required("prisma") as any);

  const signature = BuildSignature(prefs);
  const peerId = await redis.atomicPopFromStrictQueue!(signature);

  const queueCurrent = async () => {
    const score =
      (redis.getQualityScore ? await redis.getQualityScore(userId) : 0) ?? 0;
    await redis.saveUserState!(userId, { prefs, signature });
    await redis.addToStrictQueue!(signature, userId, score);
    await redis.addToWaitingSet!("strict", userId);
    return { status: "queued" as const };
  };

  if (!peerId) {
    return queueCurrent();
  }

  const token = `${userId}-${Date.now()}`;
  const lockPeer = await redis.acquireLock!(peerId, token, 2000);
  if (!lockPeer) {
    const peerState = (await redis.getUserState!(peerId)) ?? {};
    const peerScore = (await redis.getQualityScore(peerId)) ?? 0;
    await redis.addToStrictQueue!(
      peerState.signature ?? BuildSignature(peerState.prefs ?? {}),
      peerId,
      peerScore
    );
    return queueCurrent();
  }

  const lockSelf = await redis.acquireLock!(userId, token, 2000);
  if (!lockSelf) {
    await redis.releaseLock!(peerId, token);
    const peerState = (await redis.getUserState!(peerId)) ?? {};
    const peerScore = (await redis.getQualityScore(peerId)) ?? 0;
    await redis.addToStrictQueue!(
      peerState.signature ?? BuildSignature(peerState.prefs ?? {}),
      peerId,
      peerScore
    );
    return queueCurrent();
  }

  try {
    const peerState = (await redis.getUserState!(peerId)) ?? { prefs: {} };
    const selfState = (await redis.getUserState!(userId)) ?? { prefs };

    const session = await prisma.createSession!(
      peerId,
      userId,
      "strict",
      peerState.prefs ?? {},
      prefs
    );

    await redis.removeFromWaitingSet!("strict", peerId).catch(() => {});
    await redis.removeFromWaitingSet!("strict", userId).catch(() => {});
    await redis.removeFromStrictQueue!(signature, userId).catch(() => {});
    await redis.removeFromStrictQueue!(
      peerState.signature ?? signature,
      peerId
    ).catch(() => {});

    return { status: "matched", session };
  } finally {
    await redis.releaseLock!(peerId, token).catch(() => {});
    await redis.releaseLock!(userId, token).catch(() => {});
  }
}
