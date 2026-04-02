/**
 * Interval overlap: [a1,a2) vs [b1,b2) — overlap if NOT (a2 <= b1 || a1 >= b2)
 */
function intervalsOverlap(startA, endA, startB, endB) {
  const a1 = new Date(startA).getTime();
  const a2 = new Date(endA).getTime();
  const b1 = new Date(startB).getTime();
  const b2 = new Date(endB).getTime();
  if (a1 >= a2 || b1 >= b2) return false;
  return !(a2 <= b1 || a1 >= b2);
}

module.exports = { intervalsOverlap };
