import * as redis from "./mocks/redisMock";
import * as prisma from "./mocks/prismaMock";
import {
  looseJoin,
  fetchCandidatesFor,
  scoreCandidates,
} from "../services/match/loose";

async function main() {
  await looseJoin(
    "A",
    { interests: ["music", "sports"], region: "us", ageRange: [25, 35] },
    { redis, prisma }
  );
  await looseJoin(
    "B",
    { interests: ["music"], region: "us", ageRange: [30, 40] },
    { redis, prisma }
  );
  await looseJoin(
    "C",
    { interests: ["cooking"], region: "in", ageRange: [20, 25] },
    { redis, prisma }
  );

  const candidates = await fetchCandidatesFor(
    "X",
    { interests: ["music"], region: "us" },
    { redis, maxPerField: 5, maxCandidates: 10 }
  );
  console.log("sampled candidates (expect A,B):", candidates);

  const scored = await scoreCandidates(
    "X",
    { interests: ["music"], region: "us" },
    candidates,
    { redis }
  );
  console.log("scored (desc):", scored);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
