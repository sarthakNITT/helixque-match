/**
 * Jaccard similarity for arrays / strings.
 * - strings are split on non-word chars into tokens.
 * - arrays assumed to contain primitives.
 * Returns value between 0 and 1.
 */
export function jaccard(a: any, b: any): number {
  if (a == null || b == null) return 0;
  const toSet = (x: any): Set<string> => {
    if (Array.isArray(x)) {
      return new Set(
        x.map((v) => String(v).toLowerCase().trim()).filter(Boolean)
      );
    }
    if (
      typeof x === "string" ||
      typeof x === "number" ||
      typeof x === "boolean"
    ) {
      const s = String(x).toLowerCase().trim();
      const tokens = s.length ? s.split(/\W+/).filter(Boolean) : [];
      return new Set(tokens.length ? tokens : [s]);
    }
    if (typeof x === "object") {
      const vals = Object.values(x)
        .map((v) => String(v).toLowerCase().trim())
        .filter(Boolean);
      return new Set(vals);
    }
    return new Set();
  };

  const A = toSet(a);
  const B = toSet(b);

  const inter = [...A].filter((v) => B.has(v)).length;
  const union = new Set([...A, ...B]).size;
  if (union === 0) return 0;
  return inter / union;
}

/**
 * Numeric range overlap.
 * rangeA and rangeB can be:
 *  - single number (interpreted as exact match)
 *  - array [min, max]
 * returns fraction between 0 and 1 of overlap relative to union span.
 */
export function numericRangeOverlap(
  rangeA: number | [number, number],
  rangeB: number | [number, number]
): number {
  const toRange = (r: any): [number, number] => {
    if (r == null) return [0, 0];
    if (Array.isArray(r))
      return [Number(r[0]), Number(r[1])].sort((x, y) => x - y) as [
        number,
        number,
      ];
    const v = Number(r);
    return [v, v];
  };
  const [a1, a2] = toRange(rangeA);
  const [b1, b2] = toRange(rangeB);

  const interMin = Math.max(a1, b1);
  const interMax = Math.min(a2, b2);
  if (interMax < interMin) return 0;

  const inter = interMax - interMin;
  const unionMin = Math.min(a1, b1);
  const unionMax = Math.max(a2, b2);
  const union = Math.max(1e-9, unionMax - unionMin);
  return inter / union;
}

/**
 * Compute similarity across two preference objects.
 * Strategy:
 *  - list all keys present in either object
 *  - for each key compute a per-key similarity (jaccard for strings/arrays, numericRangeOverlap for numbers/arrays of two, recursive for objects)
 *  - final similarity = average of per-key similarities (0..1)
 */
export function computeSimilarity(prefsA: any, prefsB: any): number {
  if (!prefsA && !prefsB) return 1;
  if (!prefsA || !prefsB) return 0;

  const keys = Array.from(
    new Set([...Object.keys(prefsA || {}), ...Object.keys(prefsB || {})])
  ).sort();

  if (keys.length === 0) return 0;

  const scores: number[] = [];

  for (const k of keys) {
    const a = prefsA?.[k];
    const b = prefsB?.[k];

    if (a == null && b == null) {
      scores.push(1);
      continue;
    }
    if (a == null || b == null) {
      scores.push(0);
      continue;
    }

    if (
      typeof a === "number" ||
      typeof b === "number" ||
      (Array.isArray(a) &&
        a.length === 2 &&
        a.every((v: any) => !isNaN(Number(v)))) ||
      (Array.isArray(b) &&
        b.length === 2 &&
        b.every((v: any) => !isNaN(Number(v))))
    ) {
      scores.push(numericRangeOverlap(a, b));
      continue;
    }

    if (
      typeof a === "object" &&
      typeof b === "object" &&
      !Array.isArray(a) &&
      !Array.isArray(b)
    ) {
      scores.push(computeSimilarity(a, b));
      continue;
    }

    scores.push(jaccard(a, b));
  }

  const sum = scores.reduce((s, x) => s + x, 0);
  return sum / scores.length;
}

/**
 * Compute final match score (0..100) combining similarity (0..1) and candidate quality score.
 * deps.redis.getQualityScore(candidateId) should return numeric quality (e.g., 0..100).
 * We weight: similarity 70%, quality 30%.
 */
export async function computeMatchScore(
  userId: string,
  candidateId: string,
  similarity: number,
  deps: { redis: { getQualityScore: (u: string) => Promise<number> } }
): Promise<number> {
  if (!deps?.redis?.getQualityScore)
    throw new Error("redis.getQualityScore required in deps");

  const quality = (await deps.redis.getQualityScore(candidateId)) ?? 0;
  const qNorm = Math.max(0, Math.min(1, Number(quality) / 100));
  const sim = Math.max(0, Math.min(1, similarity));

  const final = sim * 0.7 + qNorm * 0.3;
  return Math.round(final * 100);
}
