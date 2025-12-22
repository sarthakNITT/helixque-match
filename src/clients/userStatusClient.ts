export async function updateUserStatus(
  userId: string,
  status: string,
  strictPrefKey?: string
) {
  try {
    await fetch(`${process.env.USER_DATA_SERVICE_URL}/users/${userId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, strictPrefKey }),
    });
  } catch (err) {
    console.warn(`[Mock] Failed to update user status for ${userId}:`, err);
  }
}
