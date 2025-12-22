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
