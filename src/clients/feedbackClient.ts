export async function sendFeedbackToUserDataService(payload: {
  matchId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  tags?: string[];
}) {
  try {
    const response = await fetch(
      `${process.env.USER_DATA_SERVICE_URL}/feedback`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.warn(`[FeedbackClient] Failed to send feedback:`, text);
      // We don't throw properly here to avoid crashing the user flow, but logging is essential.
    } else {
      const data = await response.json();
      // console.log("[FeedbackClient] Success:", data);
    }
  } catch (err) {
    console.warn(`[FeedbackClient] Network error sending feedback:`, err);
  }
}
