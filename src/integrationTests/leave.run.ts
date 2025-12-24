import * as redis from "./mocks/redisMock";
import { leave } from "../services/match/index";

async function main() {
  await redis.saveUserState("u10", {
    prefs: { lang: "en" },
    signature: "lang=en",
  });
  await redis.addToStrictQueue("lang=en", "u10", 50);
  await redis.addToWaitingSet("strict", "u10");

  await redis.addToLooseIndex("lang", "en", "u10", 70);
  await redis.addToWaitingSet("loose", "u10");

  const before = {
    strictQueue: [...(redis.__internal.strictQueues.get("lang=en") ?? [])],
    looseIdx: [...(redis.__internal.looseIndexes.get("lang:en") ?? [])],
    waitingStrict: [...(redis.__internal.waitingSets.get("strict") ?? [])],
    waitingLoose: [...(redis.__internal.waitingSets.get("loose") ?? [])],
    userState: await redis.getUserState("u10"),
  };
  console.log("before leave:", before);

  await leave("u10", { redis });

  const after = {
    strictQueue: [...(redis.__internal.strictQueues.get("lang=en") ?? [])],
    looseIdx: [...(redis.__internal.looseIndexes.get("lang:en") ?? [])],
    waitingStrict: [...(redis.__internal.waitingSets.get("strict") ?? [])],
    waitingLoose: [...(redis.__internal.waitingSets.get("loose") ?? [])],
    userState: await redis.getUserState("u10"),
  };
  console.log("after leave:", after);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
