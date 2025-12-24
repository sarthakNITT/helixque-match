import * as redis from "./mocks/redisMock";
import * as prisma from "./mocks/prismaMock";
import {
  looseJoin,
  fetchCandidatesFor,
  scoreCandidates,
} from "../services/match/loose";
import { join } from "../services/match/index";

async function main() {
  await looseJoin(
    "A",
    { interests: ["music"], region: "us", ageRange: [25, 35] },
    { redis }
  );

  const prefsX = { interests: ["music"], region: "us", ageRange: [28, 32] };
  const res = await join("X", "loose", prefsX, { redis });
  console.log("join result (expect matched):", res.status);

  if (res.status === "matched") {
    console.log("session:", res.session);
  } else {
    console.log(
      "user queued (unexpected for test) — queued state:",
      await redis.getUserState("X")
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
