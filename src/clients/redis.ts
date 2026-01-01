import Redis from "ioredis";
import { env } from "../config/env";
import { log } from "../utils/logger";

const redis = new Redis(env.REDIS_URL);

redis.on("error", (err) => {
  log("redis_error", { error: err.message });
});

redis.on("connect", () => {
  log("redis_connect", { url: env.REDIS_URL });
});

export async function getUserState(userId: string): Promise<any | null> {
  const data = await redis.get(`user:${userId}`);
  return data ? JSON.parse(data) : null;
}

export async function saveUserState(
  userId: string,
  stateObj: any
): Promise<void> {
  if (stateObj === null) {
    await redis.del(`user:${userId}`);
  } else {
    await redis.set(`user:${userId}`, JSON.stringify(stateObj), "EX", 3600);
  }
}

export async function addToStrictQueue(
  signature: string,
  userId: string,
  score = 0
): Promise<void> {
  await redis.zadd(`strict:queue:${signature}`, score, userId);
}

export async function atomicPopFromStrictQueue(
  signature: string
): Promise<string | null> {
  const result = await redis.zrevrange(`strict:queue:${signature}`, 0, 0);
  if (result.length === 0) return null;

  const userId = result[0];
  const removedCount = await redis.zrem(`strict:queue:${signature}`, userId);

  if (removedCount === 0) {
    return atomicPopFromStrictQueue(signature);
  }

  return userId;
}

export async function removeFromStrictQueue(
  signature: string,
  userId: string
): Promise<void> {
  await redis.zrem(`strict:queue:${signature}`, userId);
}

/**
 * Loose Index (Sorted Set)
 * - Key: loose:index:<field>:<value>
 * - Score: Quality Score
 * - Member: UserId
 */
export async function addToLooseIndex(
  field: string,
  value: string,
  userId: string,
  score = 0
): Promise<void> {
  const key = `loose:index:${field.toLowerCase()}:${String(value).toLowerCase()}`;
  await redis.zadd(key, score, userId);
}

export async function fetchTopNFromIndex(
  field: string,
  value: string,
  N: number
): Promise<string[]> {
  const key = `loose:index:${field.toLowerCase()}:${String(value).toLowerCase()}`;
  return redis.zrevrange(key, 0, N - 1);
}

export async function removeUserFromAllLooseIndexes(
  userId: string,
  prefs?: any
): Promise<void> {
  if (!prefs) return;
  for (const rawKey of Object.keys(prefs)) {
    const key = String(rawKey).toLowerCase();
    const val = prefs[rawKey];
    if (val == null) continue;

    const valuesToRemove: string[] = [];

    if (Array.isArray(val)) {
      for (const it of val) valuesToRemove.push(String(it));
    } else if (typeof val === "object") {
      for (const sub of Object.values(val)) {
        if (sub == null) continue;
        if (Array.isArray(sub))
          for (const it of sub) valuesToRemove.push(String(it));
        else valuesToRemove.push(String(sub));
      }
    } else {
      valuesToRemove.push(String(val));
    }

    for (const v of valuesToRemove) {
      const idxKey = `loose:index:${key}:${v.toLowerCase()}`;
      await redis.zrem(idxKey, userId);
    }
  }
}

/**
 * Waiting Sets (Standard Sets)
 */
export async function addToWaitingSet(
  mode: string,
  userId: string
): Promise<void> {
  await redis.sadd(`waiting:${mode}`, userId);
}

export async function removeFromWaitingSet(
  mode: string,
  userId: string
): Promise<void> {
  await redis.srem(`waiting:${mode}`, userId);
}

/**
 * Locking
 */
export async function acquireLock(
  userId: string,
  token: string,
  ttlMs = 1000
): Promise<boolean> {
  const key = `lock:${userId}`;
  const result = await redis.set(key, token, "PX", ttlMs, "NX");
  return result === "OK";
}

export async function releaseLock(
  userId: string,
  token: string
): Promise<boolean> {
  const key = `lock:${userId}`;
  const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
    else
        return 0
    end
  `;
  const result = await redis.eval(script, 1, key, token);
  return result === 1;
}

/**
 * Quality Score Stub
 * In real world this might fetch from DB or another Redis key
 */
export async function getQualityScore(userId: string): Promise<number> {
  return 100;
}

export default redis;
