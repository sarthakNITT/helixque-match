type Session = {
  id: string;
  userA: string;
  userB: string;
  mode: string;
  prefsA: any;
  prefsB: any;
  createdAt: string;
  ended?: boolean;
};

const sessions: Session[] = [];

export async function createSession(
  userA: string,
  userB: string,
  mode: string,
  prefsA: any,
  prefsB: any
) {
  const id = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const session: Session = {
    id,
    userA,
    userB,
    mode,
    prefsA,
    prefsB,
    createdAt: new Date().toISOString(),
  };
  sessions.push(session);
  return session;
}

export async function endSession(sessionId: string) {
  const s = sessions.find((x) => x.id === sessionId);
  if (!s) return { success: false, sessionId };
  s.ended = true;
  return { success: true, sessionId };
}

export function getAllSessions() {
  return sessions.map((s) => ({ ...s }));
}

export function __reset() {
  sessions.length = 0;
}
