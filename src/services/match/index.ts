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

export async function endSession(
  sessionId: string,
  userIds: string[],
  deps?: { redis?: any }
) {
  if (!deps?.redis) throw new Error("redis required");

  // Call the external service to end match (fire & forget or await)
  await endMatch(sessionId);

  // Clear state for all involved users
  for (const uid of userIds) {
    if (!uid) continue;
    try {
      const state = await deps.redis.getUserState(uid);
      if (state && state.sessionId === sessionId) {
        // Clear the state or just remove session info?
        // Based on logic elsewhere, we reset to null or clear session.
        // Usually we want to clear the 'in match' status.
        // Let's modify the state to remove session info.
        /* 
          If we just want to remove them from being "in call", we can nullify sessionId.
          But if we want to fully reset, we might set state to null.
          The previous logic did:
             await deps.redis.saveUserState(userId, { ...state, sessionId: null });
          Let's stick to that.
        */
        const { sessionId: _, peerId: __, ...rest } = state;
        // If there's nothing left effectively, maybe null?
        // But prefs might be needed?
        // Actually, usually after match end, user goes back to idle.
        // Let's just remove sessionId and peerId.
        await deps.redis.saveUserState(uid, {
          ...rest,
          sessionId: null,
          peerId: null,
        });
      }
    } catch (err) {
      console.warn(`endSession cleanup error for ${uid}:`, err);
    }
  }
}

export async function markMatchEnd(
  matchId: string,
  userId: string,
  reason: string,
  deps?: { redis?: any }
): Promise<{ success: boolean }> {
  const redis = deps?.redis;
  if (!redis) throw new Error("redis required");

  // Validate match existence for user
  const state = await redis.getUserState(userId);
  if (!state || state.sessionId !== matchId) {
    throw new Error("Match not found");
  }

  const peerId = state.peerId;
  const participants = [userId];
  if (peerId) participants.push(peerId);

  await endSession(matchId, participants, deps);
  return { success: true };
}

export async function submitFeedback(
  payload: any,
  deps?: { redis?: any }
): Promise<{ success: true; message: string }> {
  // Simulate feedback submission
  return { success: true, message: "Feedback submitted successfully" };
}
