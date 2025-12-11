export async function createSession(
  userA: string,
  userB: string,
  mode: string,
  prefsA: any,
  prefsB: any
) {
  const id = `sess-${Date.now()}`;
  return {
    id,
    userA,
    userB,
    mode,
    prefsA,
    prefsB,
    createdAt: new Date().toISOString(),
  };
}

export async function endSession(sessionId: string) {
  return { success: true, sessionId };
}
