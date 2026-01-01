import * as redis from "./mocks/redisMock";
import * as prisma from "./mocks/prismaMock";
import { join, leave } from "../services/match/index";
import { sweepStaleWaiters } from "../services/match/sweeper";

async function main() {
  const prefs = { language: ["en"], region: "us" };

  await join("T1", "strict", prefs, { redis });
  console.log("joined T1");

  const state = await redis.getUserState("T1");
  state.joinedAt -= 10_000;
  await redis.saveUserState("T1", state);

  await sweepStaleWaiters(5_000, { redis, leave });

  const after = await redis.getUserState("T1");
  console.log("state after sweep (expect null):", after);
}

main().catch(console.error);
