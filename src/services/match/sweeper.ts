export async function sweepStaleWaiters(
  ttlMs: number,
  deps: {
    redis: {
      __internal?: {
        userState: Map<string, any>;
      };
    };
    leave: (userId: string, deps: { redis: any }) => Promise<any>;
  }
) {
  const internal = deps.redis.__internal;
  if (!internal) throw new Error("redis.__internal required for sweeper");

  const now = Date.now();
  for (const [userId, state] of internal.userState.entries()) {
    if (!state || !state.joinedAt || !state.mode) continue;
    if (now - state.joinedAt > ttlMs) {
      await deps.leave(userId, { redis: deps.redis });
    }
  }
}
