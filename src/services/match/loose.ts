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
) {
  if (!deps?.redis) throw new Error("redis required");
  const redis = deps.redis;

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
        if (Array.isArray(sub)) {
          for (const it of sub) {
            await redis.addToLooseIndex(key, String(it), userId, score);
          }
        } else {
          await redis.addToLooseIndex(key, String(sub), userId, score);
        }
      }
    } else {
      await redis.addToLooseIndex(key, String(val), userId, score);
    }
  }

  await redis.addToWaitingSet("loose", userId);
  return { status: "queued" as const };
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
  deps: { redis: any; prisma: any }
) {
  return null;
}
