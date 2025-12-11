// tests/run_redisMock.ts
import * as redis from "./mocks/redisMock";

async function main() {
  await redis.saveUserState("u1", { name: "Alice" });
  await redis.saveUserState("u2", { name: "Bob" });

  await redis.addToStrictQueue("lang=en|region=us", "u1", 10);
  await redis.addToStrictQueue("lang=en|region=us", "u2", 5);

  const popped = await redis.atomicPopFromStrictQueue("lang=en|region=us");
  console.log("popped (expect u1):", popped);

  await redis.addToLooseIndex("interest", "music", "u2", 50);
  await redis.addToLooseIndex("interest", "music", "u1", 70);

  const top = await redis.fetchTopNFromIndex("interest", "music", 2);
  console.log("top interest music (expect u1,u2):", top.join(","));

  const lockToken = "tok-123";
  const lockAcquired = await redis.acquireLock("u1", lockToken, 200);
  console.log("lock acquired (expect true):", lockAcquired);

  const lockFail = await redis.acquireLock("u1", "tok-999", 200);
  console.log("lock reacquire attempt (expect false):", lockFail);

  const released = await redis.releaseLock("u1", lockToken);
  console.log("lock released (expect true):", released);

  const q = await redis.getQualityScore("u1");
  console.log("quality score (expect 100):", q);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
