import { strictJoin } from "./strict";
import { looseJoin } from "./loose";
import { endMatch } from "../../clients/userDataClient";

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

  await redis.saveUserState!(userId, null).catch(() => {});

  return { status: "ok" };
}

export async function join(
  userId: string,
  mode: "strict" | "loose",
  prefs: any,
  deps?: {
    redis?: any;
  }
): Promise<{ status: string; session?: any }> {
  if (!deps?.redis) throw new Error("redis dependency required");

  try {
    await leave(userId, { redis: deps.redis });
  } catch (err) {
    console.warn(
      "join: leave() cleanup error (continuing):",
      (err as any)?.message ?? err
    );
  }

  if (mode === "strict") return strictJoin(userId, prefs, deps);
  if (mode === "loose") return looseJoin(userId, prefs, deps);

  throw new Error("unsupported mode");
}

export async function endSession(sessionId: string, deps?: { redis?: any }) {
  if (!deps?.redis) throw new Error("redis required");

  const res = await endMatch(sessionId);

  for (const [userId, state] of deps.redis.__internal.userState.entries()) {
    if (state?.sessionId === sessionId) {
      await deps.redis.saveUserState(userId, {
        ...state,
        sessionId: null,
      });
    }
  }

  return res;
}
