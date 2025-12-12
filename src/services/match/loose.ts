import { BuildSignature } from "../../utils/buildSignature";
import { computeSimilarity, computeMatchScore } from "../../utils/score";

type Deps = {
  redis: {
    saveUserState: (u: string, s: any) => Promise<void>;
    addToWaitingSet: (mode: string, u: string) => Promise<void>;
    addToLooseIndex: (
      field: string,
      value: string,
      u: string,
      score?: number
    ) => Promise<void>;
    fetchTopNFromIndex: (
      field: string,
      value: string,
      n: number
    ) => Promise<string[]>;
    getQualityScore?: (u: string) => Promise<number>;
  };
  prisma?: any;
};

/**
 * Loose join:
 *  - save user state
 *  - add to waiting set 'loose'
 *  - index this user across preference fields (for arrays, index each element)
 */
export async function looseJoin(
  userId: string,
  prefs: any,
  deps?: Partial<Deps>
): Promise<{ status: "queued" } | { status: "matched"; session: any }> {
  if (!deps?.redis) throw new Error("redis required");
  if (!deps?.prisma) throw new Error("prisma required");
  const redis = deps.redis;
  const prisma = deps.prisma;

  const MATCH_THRESHOLD = 60;

  const candidates = await fetchCandidatesFor(userId, prefs, {
    redis: redis as any,
    maxPerField: 10,
    maxCandidates: 50,
  });

  if (candidates.length > 0) {
    const scored = await scoreCandidates(userId, prefs, candidates, {
      redis: redis as any,
    });
    if (scored.length > 0) {
      const top = scored[0];
      if (top.score >= MATCH_THRESHOLD) {
        const signature = BuildSignature(prefs);
        await redis.saveUserState(userId, { prefs, signature }).catch(() => {});

        const final = await finalizeLooseMatch(userId, top.userId, prefs, {
          redis: redis as any,
          prisma,
        });
        if (final && final.status === "matched") {
          return final;
        }

        await redis.saveUserState(userId, null).catch(() => {});
      }
    }
  }

  const signature = BuildSignature(prefs);
  await redis.saveUserState(userId, { prefs, signature });

  const score = redis.getQualityScore
    ? ((await redis.getQualityScore(userId)) ?? 0)
    : 0;

  for (const rawKey of Object.keys(prefs || {})) {
    const key = String(rawKey).toLowerCase();
    const val = prefs[rawKey];
    if (val == null) continue;

    if (Array.isArray(val)) {
      for (const it of val) {
        await redis.addToLooseIndex(key, String(it), userId, score);
      }
    } else if (typeof val === "object") {
      for (const sub of Object.values(val)) {
        if (sub == null) continue;
        if (Array.isArray(sub))
          for (const it of sub)
            await redis.addToLooseIndex(key, String(it), userId, score);
        else await redis.addToLooseIndex(key, String(sub), userId, score);
      }
    } else {
      await redis.addToLooseIndex(key, String(val), userId, score);
    }
  }

  await redis.addToWaitingSet("loose", userId);
  return { status: "queued" };
}

/**
 * Fetch candidate userIds for given user prefs:
 *  - for each field/value, call fetchTopNFromIndex(field, value, N)
 *  - dedupe, remove self, limit result to maxCandidates
 */
export async function fetchCandidatesFor(
  userId: string,
  prefs: any,
  deps?: { redis: Deps["redis"]; maxPerField?: number; maxCandidates?: number }
): Promise<string[]> {
  if (!deps?.redis) throw new Error("redis required");
  const redis = deps.redis;
  const perField = deps.maxPerField ?? 10;
  const maxCandidates = deps.maxCandidates ?? 100;

  const candidateSet = new Set<string>();

  for (const rawKey of Object.keys(prefs || {})) {
    const key = String(rawKey).toLowerCase();
    const val = prefs[rawKey];
    if (val == null) continue;

    const valuesToQuery: string[] = [];
    if (Array.isArray(val)) {
      for (const it of val) if (it != null) valuesToQuery.push(String(it));
    } else if (typeof val === "object") {
      for (const sub of Object.values(val)) {
        if (sub == null) continue;
        if (Array.isArray(sub))
          for (const it of sub) valuesToQuery.push(String(it));
        else valuesToQuery.push(String(sub));
      }
    } else {
      valuesToQuery.push(String(val));
    }

    for (const v of valuesToQuery) {
      const top = await redis.fetchTopNFromIndex(key, v, perField);
      for (const c of top) {
        if (c === userId) continue;
        candidateSet.add(c);
        if (candidateSet.size >= maxCandidates) break;
      }
      if (candidateSet.size >= maxCandidates) break;
    }
    if (candidateSet.size >= maxCandidates) break;
  }

  return Array.from(candidateSet).slice(0, maxCandidates);
}

export async function scoreCandidates(
  userId: string,
  prefs: any,
  candidates: string[],
  deps: {
    redis: {
      getUserState: (u: string) => Promise<any>;
      getQualityScore?: (u: string) => Promise<number>;
    };
  }
): Promise<{ userId: string; score: number; similarity: number }[]> {
  if (!deps?.redis || !deps.redis.getUserState)
    throw new Error("redis.getUserState required");

  const results: { userId: string; score: number; similarity: number }[] = [];

  for (const cand of candidates) {
    const candState = await deps.redis.getUserState(cand);
    if (!candState || !candState.prefs) {
      continue;
    }

    const sim = computeSimilarity(prefs, candState.prefs);

    const score = await computeMatchScore(userId, cand, sim, {
      redis: deps.redis as any,
    });

    results.push({ userId: cand, score, similarity: sim });
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.similarity - a.similarity;
  });

  return results;
}

export async function finalizeLooseMatch(
  userId: string,
  peerId: string,
  prefs: any,
  deps: {
    redis: {
      acquireLock: (
        u: string,
        token: string,
        ttlMs?: number
      ) => Promise<boolean>;
      releaseLock: (u: string, token: string) => Promise<boolean>;
      getUserState: (u: string) => Promise<any>;
      removeUserFromAllLooseIndexes: (u: string, prefs?: any) => Promise<void>;
      removeFromWaitingSet: (mode: string, u: string) => Promise<void>;
      saveUserState: (u: string, state: any) => Promise<void>;
    };
    prisma: {
      createSession: (
        a: string,
        b: string,
        mode: string,
        prefsA: any,
        prefsB: any
      ) => Promise<any>;
    };
  }
): Promise<{ status: "matched"; session: any } | null> {
  if (!deps?.redis) throw new Error("redis required");
  if (!deps?.prisma) throw new Error("prisma required");

  const redis = deps.redis;
  const prisma = deps.prisma;

  const token = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const ttlMs = 3000;

  const [first, second] = userId < peerId ? [userId, peerId] : [peerId, userId];

  const lockedFirst = await redis.acquireLock(first, token, ttlMs);
  if (!lockedFirst) return null;

  const lockedSecond = await redis.acquireLock(second, token, ttlMs);
  if (!lockedSecond) {
    await redis.releaseLock(first, token).catch(() => {});
    return null;
  }

  try {
    const peerState = await redis.getUserState(peerId);
    const selfState = await redis.getUserState(userId);

    if (!peerState || !peerState.prefs) {
      return null;
    }
    if (!selfState || !selfState.prefs) {
      return null;
    }

    const session = await prisma.createSession(
      peerId,
      userId,
      "loose",
      peerState.prefs,
      selfState.prefs
    );

    await redis
      .removeUserFromAllLooseIndexes(peerId, peerState.prefs)
      .catch(() => {});
    await redis
      .removeUserFromAllLooseIndexes(userId, selfState.prefs)
      .catch(() => {});

    await redis.removeFromWaitingSet("loose", peerId).catch(() => {});
    await redis.removeFromWaitingSet("loose", userId).catch(() => {});

    await redis.saveUserState(peerId, null).catch(() => {});
    await redis.saveUserState(userId, null).catch(() => {});

    return { status: "matched", session };
  } finally {
    await redis.releaseLock(first, token).catch(() => {});
    await redis.releaseLock(second, token).catch(() => {});
  }
}
