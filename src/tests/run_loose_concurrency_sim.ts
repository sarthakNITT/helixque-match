import * as redis from "./mocks/redisMock";
import * as prisma from "./mocks/prismaMock";
import { join } from "../services/match/index";

async function main() {
  prisma.__reset();

  const prefs = { interests: ["music"], region: "us", ageRange: [25, 35] };
  const userIds = ["U1", "U2", "U3", "U4", "U5", "U6"];

  for (const id of userIds) {
    const res = await join(id, "loose", prefs, { redis, prisma });
    console.log(`${id} join returned:`, res.status);
  }

  await new Promise((r) => setTimeout(r, 100));

  const sessions = prisma.getAllSessions();
  console.log("total sessions (expect 3):", sessions.length);
  console.log(
    "sessions:",
    sessions.map((s) => ({ id: s.id, userA: s.userA, userB: s.userB }))
  );

  const participants = sessions.flatMap((s) => [s.userA, s.userB]);
  const unique = Array.from(new Set(participants));
  console.log("unique participants count (expect 6):", unique.length);
  console.log("unique participants:", unique);

  if (sessions.length !== 3) {
    console.error("FAIL: expected 3 sessions");
    process.exit(2);
  }
  if (unique.length !== 6) {
    console.error("FAIL: expected 6 unique participants (no double-matches)");
    process.exit(3);
  }

  console.log(
    "PASS: loose matching produced 3 sessions with unique participants."
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
