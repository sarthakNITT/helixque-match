export function log(event: string, data: Record<string, any> = {}) {
  const payload = {
    ts: new Date().toISOString(),
    event,
    ...data,
  };
  console.log(JSON.stringify(payload));
}
