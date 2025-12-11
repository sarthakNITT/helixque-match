import * as redis from "./mocks/redisMock";
import * as prisma from "./mocks/prismaMock";
import { strictJoin } from "../services/match/strict";

async function main() {
  const prefsA = { language: ["en"], region: "US" };
  const prefsB = { region: "US", language: ["EN"] };

  const res1 = await strictJoin("user1", prefsA, { redis, prisma });
  console.log("user1 result (expect queued):", res1);

  const res2 = await strictJoin("user2", prefsB, { redis, prisma });
  console.log(
    "user2 result (expect matched):",
    res2.status === "matched" ? "matched" : res2
  );

  if (res2.status === "matched") {
    console.log("session includes:", res2.session);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
