import * as redis from "./mocks/redisMock";
import * as prisma from "./mocks/prismaMock";
import { looseJoin, finalizeLooseMatch } from "../services/match/loose";

async function main() {
  await looseJoin("A", { interests: ["music"], region: "us" }, { redis });

  const prefsX = { interests: ["music"], region: "us" };
  await looseJoin("X", prefsX, { redis });

  const res = await finalizeLooseMatch("X", "A", prefsX, { redis });
  console.log("finalize result (expect matched):", res?.status ?? null);
  if (res?.status === "matched") {
    console.log("session:", res.session);
  }

  const waiting = [...(redis.__internal.waitingSets.get("loose") ?? [])];
  console.log("waiting set after finalize (expect empty):", waiting);

  const stA = await redis.getUserState("A");
  const stX = await redis.getUserState("X");
  console.log("state A (expect null):", stA);
  console.log("state X (expect null):", stX);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
