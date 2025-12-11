import * as redis from "./mocks/redisMock";
import * as prisma from "./mocks/prismaMock";
import { join } from "../services/match/index";

async function main() {
  const prefs = { language: ["en"], region: "us" };

  const res1 = await join("A", "strict", prefs, { redis, prisma });
  console.log("A join result (expect queued):", res1);

  const res2 = await join("B", "strict", prefs, { redis, prisma });
  console.log("B join result (expect matched):", res2.status);

  if (res2.status === "matched") {
    console.log("session:", res2.session);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
