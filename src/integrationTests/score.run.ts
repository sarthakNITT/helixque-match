import {
  jaccard,
  numericRangeOverlap,
  computeSimilarity,
  computeMatchScore,
} from "../utils/score";
import * as redis from "./mocks/redisMock";

async function main() {
  console.log(
    "jaccard [en,fr] vs [fr,en] (expect 1):",
    jaccard(["en", "fr"], ["fr", "en"])
  );
  console.log(
    'jaccard "hello world" vs "hello" (expect >0):',
    jaccard("hello world", "hello")
  );
  console.log(
    "numericRangeOverlap [20,30] vs [25,35] (expect 0.333...):",
    numericRangeOverlap([20, 30], [25, 35])
  );
  console.log(
    "numericRangeOverlap 30 vs [25,35] (expect 0):",
    numericRangeOverlap(30, [25, 35])
  );

  const A = {
    language: ["en", "fr"],
    ageRange: [25, 35],
    extras: { hd: true },
  };
  const B = { language: ["en"], ageRange: [30, 40], extras: { hd: true } };

  const sim = computeSimilarity(A, B);
  console.log("similarity (0..1):", sim);

  const score = await computeMatchScore("uA", "uB", sim, { redis });
  console.log("final match score (0..100):", score);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
