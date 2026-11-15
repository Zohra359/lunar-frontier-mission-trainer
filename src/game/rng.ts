/**
 * Deterministic random-number generator for the Lunar Frontier simulator.
 *
 * The same seed, day, and salt always produce the same result.
 * This keeps mission events reproducible and avoids Math.random().
 */

const TWO_POW_32 = 0x1_0000_0000;

function mix(value: number): number {
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  return (value ^ (value >>> 16)) >>> 0;
}

/**
 * Returns a deterministic number in the range [0, 1).
 */
export function rollUnit(
  seed: number,
  day: number,
  salt: string,
): number {
  let hash = mix(seed >>> 0);
  hash = mix(hash ^ (day >>> 0));

  for (let i = 0; i < salt.length; i += 1) {
    hash = mix(hash ^ salt.charCodeAt(i));
  }

  return hash / TWO_POW_32;
}