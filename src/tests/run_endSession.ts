import * as prisma from "./mocks/prismaMock";
import { endSession } from "../services/match/index";

async function main() {
  const created = await prisma.createSession(
    "uA",
    "uB",
    "loose",
    { a: 1 },
    { b: 2 }
  );
  console.log("created session id:", created.id);

  const res = await endSession(created.id, { prisma });
  console.log("endSession result (expect success):", res);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
