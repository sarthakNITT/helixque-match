import { BuildSignature } from "../../utils/buildSignature";

export async function looseJoin(
  userId: string,
  prefs: any,
  deps?: {
    redis?: any;
    prisma?: any;
  }
): Promise<{ status: "queued" } | { status: "matched"; session: any }> {
  if (!deps?.redis) throw new Error("redis required");
  if (!deps?.prisma) throw new Error("prisma required");

  const signature = BuildSignature(prefs);
  await deps.redis.saveUserState(userId, { prefs, signature });
  await deps.redis.addToWaitingSet("loose", userId);

  return { status: "queued" };
}

/**
 * Later this function will:
 *  - sample top-K users from loose indexes per field
 *  - dedupe, filter out self, filter out users already in sessions
 */
export async function fetchCandidatesFor(
  userId: string,
  prefs: any,
  deps: { redis: any }
): Promise<string[]> {
  return [];
}

/**
 * Later steps will compute:
 *  - similarity score
 *  - quality score
 *  - final match score
 */
export async function scoreCandidates(
  userId: string,
  prefs: any,
  candidates: string[],
  deps: { redis: any }
): Promise<{ userId: string; score: number }[]> {
  return [];
}

/**
 * Later steps will:
 *  - acquire locks on both users
 *  - validate states
 *  - create session
 *  - cleanup queues/indexes/waiting sets
 */
export async function finalizeLooseMatch(
  userId: string,
  peerId: string,
  prefs: any,
  deps: { redis: any; prisma: any }
): Promise<{ status: "matched"; session: any } | null> {
  return null;
}
