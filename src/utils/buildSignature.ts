// language: "English",
// domain: "Frontend",
// techStack: ["React", "Node"],
// experience: "1-3",
// country: "IN",

export interface UserPreferences {
  techStack: string | string[];
  language: string | string[];
  experience: string | string[];
  domain: string | string[];
  country: string | string[];
}

export function BuildSignature(prefs: any): string {
  if (prefs === null || prefs === undefined) return "";

  function normalize(value: any): string {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value.trim().toLowerCase();
    if (typeof value === "number" || typeof value === "boolean")
      return String(value);
    if (Array.isArray(value)) {
      const items = value
        .map(normalize)
        .filter((v) => v !== "")
        .sort();
      return items.join(",");
    }
    if (typeof value === "object") {
      const keys = Object.keys(value)
        .map((k) => k.toLowerCase())
        .filter((k) => value[k] !== undefined && value[k] !== null)
        .sort();
      const parts = keys
        .map((k) => `${k}=${normalize(value[k])}`)
        .filter((p) => !p.endsWith("="));
      return `{${parts.join("|")}}`;
    }
    return String(value);
  }

  const keys = Object.keys(prefs)
    .map((k) => k.toLowerCase())
    .filter((k) => prefs[k] !== undefined && prefs[k] !== null)
    .sort();

  const parts = keys
    .map((k) => {
      const origKey = Object.keys(prefs).find(
        (kk) => kk.toLowerCase() === k
      ) as string | undefined;
      const val = normalize(origKey ? prefs[origKey] : prefs[k]);
      return val === "" ? null : `${k}=${val}`;
    })
    .filter(Boolean) as string[];

  return parts.join("|");
}
