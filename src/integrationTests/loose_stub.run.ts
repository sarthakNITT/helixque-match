import * as redis from "./mocks/redisMock";
import * as prisma from "./mocks/prismaMock";
import { join } from "../services/match/index";

async function main() {
  const prefs = { language: ["en"], region: "us" };

  const r = await join("X", "loose", prefs, { redis });
  console.log("loose join result (expect queued):", r);

  const state = await redis.getUserState("X");
  console.log("stored state:", state);

  const waiting = [...(redis.__internal.waitingSets.get("loose") ?? [])];
  console.log("waiting set (expect [X]):", waiting);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
