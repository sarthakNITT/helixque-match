async function main() {
  const res = await fetch("http://localhost:4001/matches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userAId: "user-1",
      userBId: "user-2",
      mode: "STRICT",
      prefKey: "language=en|region=us",
    }),
  });

  console.log(await res.json());
}

main();
