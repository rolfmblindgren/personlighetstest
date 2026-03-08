export default function cap (s: number, min = 20, max = 80) {
  return Math.min(max, Math.max(min, s));
}
