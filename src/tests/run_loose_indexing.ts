import * as redis from "./mocks/redisMock";
import * as prisma from "./mocks/prismaMock";
import { looseJoin, fetchCandidatesFor } from "../services/match/loose";

async function main() {
  await looseJoin(
    "A",
    { interests: ["music", "sports"], region: "us" },
    { redis }
  );
  await looseJoin("B", { interests: ["music"], region: "us" }, { redis });
  await looseJoin("C", { interests: ["cooking"], region: "in" }, { redis });

  const candidates = await fetchCandidatesFor(
    "X",
    { interests: ["music"], region: "us" },
    { redis, maxPerField: 5, maxCandidates: 10 }
  );
  console.log("candidates (expect A,B in any order):", candidates);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
