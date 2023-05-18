export const clamp = (num: number, max: number, min: number) =>
  Math.min(Math.max(num, min), max);
