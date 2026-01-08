const BASE = process.env.USER_DATA_SERVICE_URL!;

export async function createMatch(payload: {
  userAId: string;
  userBId: string;
  mode: "STRICT" | "LOOSE";
  prefKey?: string;
}) {
  try {
    const res = await fetch(`${BASE}/matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("createMatch failed");
    return res.json();
  } catch (err) {
    console.warn(`[Mock] Failed to create match, returning mock session:`, err);
    return { id: `mock-session-${Date.now()}` };
  }
}

export async function endMatch(matchId: string) {
  try {
    const res = await fetch(`${BASE}/matches/${matchId}/end`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("endMatch failed");
  } catch (err) {
    console.warn(`[Mock] Failed to end match ${matchId}:`, err);
  }
}

export async function fetchUserRating(userId: string): Promise<number> {
  try {
    const res = await fetch(`${BASE}/users/${userId}`, { method: "GET" });
    if (!res.ok) {
      if (res.status === 404) return 0;
      throw new Error("fetchUserRating failed");
    }
    const user = await res.json();
    const rating = user.averageRating ?? 0;
    const count = user.numFeedbacks ?? 0;

    if (count < 3) {
      return 4.0;
    }
    return rating;
  } catch (err) {
    console.warn(
      `[Mock] Failed to fetch rating for ${userId}, defaulting to 0:`,
      err
    );
    return 0;
  }
}
