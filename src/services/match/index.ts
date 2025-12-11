// services/match/index.ts
import { strictJoin } from "./strict";

export async function leave(
  userId: string,
  deps?: {
    redis?: {
      getUserState?: (u: string) => Promise<any>;
      saveUserState?: (u: string, state: any) => Promise<void>;
      removeFromStrictQueue?: (signature: string, u: string) => Promise<void>;
      removeUserFromAllLooseIndexes?: (u: string, prefs: any) => Promise<void>;
      removeFromWaitingSet?: (mode: string, u: string) => Promise<void>;
    };
  }
): Promise<{ status: "ok" }> {
  const redis = deps?.redis;
  if (!redis) throw new Error("redis dependency required");

  const state = await redis.getUserState!(userId);
  if (!state) {
    return { status: "ok" };
  }

  const signature = state.signature ?? null;
  const prefs = state.prefs ?? {};

  if (signature) {
    await redis.removeFromStrictQueue!(signature, userId).catch(() => {});
  }

  await redis.removeUserFromAllLooseIndexes!(userId, prefs).catch(() => {});
  await redis.removeFromWaitingSet!("strict", userId).catch(() => {});
  await redis.removeFromWaitingSet!("loose", userId).catch(() => {});

  // clear user state
  await redis.saveUserState!(userId, null).catch(() => {});

  return { status: "ok" };
}

export async function join(
  userId: string,
  mode: "strict" | "loose",
  prefs: any,
  deps?: {
    redis?: any;
    prisma?: any;
  }
): Promise<{ status: string; session?: any }> {
  if (!deps?.redis) throw new Error("redis dependency required");
  if (!deps?.prisma) throw new Error("prisma dependency required");

  if (mode === "strict") {
    return strictJoin(userId, prefs, deps);
  }

  // loose mode will be added in later steps
  throw new Error("loose mode not implemented yet");
}
