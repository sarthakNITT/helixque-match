const BASE = process.env.USER_DATA_SERVICE_URL!;

export async function createMatch(payload: {
  userAId: string;
  userBId: string;
  mode: "STRICT" | "LOOSE";
  prefKey?: string;
}) {
  const res = await fetch(`${BASE}/matches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("createMatch failed");
  return res.json();
}

export async function endMatch(matchId: string) {
  const res = await fetch(`${BASE}/matches/${matchId}/end`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("endMatch failed");
}
