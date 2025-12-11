type UserState = unknown;

const userState = new Map<string, UserState>();

const strictQueues = new Map<
  string,
  Array<{ userId: string; score: number; addedAt: number }>
>();

const looseIndexes = new Map<
  string,
  Array<{ userId: string; score: number; addedAt: number }>
>();

const waitingSets = new Map<string, Set<string>>();

const locks = new Map<string, { token: string; expiresAt: number }>();

export async function getUserState(userId: string): Promise<UserState | null> {
  return userState.get(userId) ?? null;
}

export async function saveUserState(
  userId: string,
  stateObj: UserState
): Promise<void> {
  userState.set(userId, stateObj);
}

export async function addToStrictQueue(
  signature: string,
  userId: string,
  score = 0
): Promise<void> {
  const now = Date.now();
  const arr = strictQueues.get(signature) ?? [];
  arr.push({ userId, score, addedAt: now });
  strictQueues.set(signature, arr);
}

export async function atomicPopFromStrictQueue(
  signature: string
): Promise<string | null> {
  const arr = strictQueues.get(signature);
  if (!arr || arr.length === 0) return null;

  arr.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.addedAt - b.addedAt;
  });
  const item = arr.shift()!;
  strictQueues.set(signature, arr);
  return item.userId;
}

export async function removeFromStrictQueue(
  signature: string,
  userId: string
): Promise<void> {
  const arr = strictQueues.get(signature);
  if (!arr) return;
  strictQueues.set(
    signature,
    arr.filter((x) => x.userId !== userId)
  );
}

export async function addToLooseIndex(
  field: string,
  value: string,
  userId: string,
  score = 0
): Promise<void> {
  const key = `${field.toLowerCase()}:${String(value).toLowerCase()}`;
  const now = Date.now();
  const arr = looseIndexes.get(key) ?? [];
  arr.push({ userId, score, addedAt: now });
  looseIndexes.set(key, arr);
}

export async function fetchTopNFromIndex(
  field: string,
  value: string,
  N: number
): Promise<string[]> {
  const key = `${field.toLowerCase()}:${String(value).toLowerCase()}`;
  const arr = looseIndexes.get(key) ?? [];

  arr.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.addedAt - b.addedAt;
  });
  return arr.slice(0, N).map((x) => x.userId);
}

export async function removeUserFromAllLooseIndexes(
  userId: string
): Promise<void> {
  for (const [k, arr] of looseIndexes.entries()) {
    const filtered = arr.filter((x) => x.userId !== userId);
    looseIndexes.set(k, filtered);
  }
}

export async function addToWaitingSet(
  mode: string,
  userId: string
): Promise<void> {
  const s = waitingSets.get(mode) ?? new Set<string>();
  s.add(userId);
  waitingSets.set(mode, s);
}

export async function removeFromWaitingSet(
  mode: string,
  userId: string
): Promise<void> {
  const s = waitingSets.get(mode);
  if (!s) return;
  s.delete(userId);
}

export async function acquireLock(
  userId: string,
  token: string,
  ttlMs = 1000
): Promise<boolean> {
  const now = Date.now();
  const existing = locks.get(userId);
  if (existing && existing.expiresAt > now) return false;
  locks.set(userId, { token, expiresAt: now + ttlMs });
  return true;
}

export async function releaseLock(
  userId: string,
  token: string
): Promise<boolean> {
  const existing = locks.get(userId);
  if (!existing) return false;
  if (existing.token !== token) return false;
  locks.delete(userId);
  return true;
}

export async function getQualityScore(_userId: string): Promise<number> {
  return 100;
}

export const __internal = {
  strictQueues,
  looseIndexes,
  waitingSets,
  userState,
  locks,
};
