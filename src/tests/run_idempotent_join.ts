import * as redis from "./mocks/redisMock";
import * as prisma from "./mocks/prismaMock";
import { join } from "../services/match/index";

async function main() {
  prisma.__reset();
  redis.__internal.strictQueues.clear();
  redis.__internal.waitingSets.clear();
  redis.__internal.userState.clear();

  const prefs = { language: ["en"], region: "us" };
  const r1 = await join("Z", "strict", prefs, { redis, prisma });
  console.log("first join:", r1);

  const r2 = await join("Z", "strict", prefs, { redis, prisma });
  console.log("second join:", r2);

  const sigs = Array.from(redis.__internal.strictQueues.keys());
  console.log("strict queue signatures:", sigs);

  let totalEntriesForZ = 0;
  for (const [sig, arr] of redis.__internal.strictQueues.entries()) {
    for (const item of arr) {
      if (item.userId === "Z") totalEntriesForZ++;
    }
  }

  console.log("total strict-queue entries for Z (expect 1):", totalEntriesForZ);

  if (totalEntriesForZ !== 1) {
    console.error("FAIL: duplicate entries detected for Z");
    process.exit(2);
  }

  console.log("PASS: join is idempotent (no duplicate queue entries).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
