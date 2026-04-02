/**
 * datetime-local value format for booking tests
 * @param {number} daysFromNow
 * @param {number} hour
 */
function localDateTime(daysFromNow, hour = 10) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function futureExpiryMMYY() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return mm + yy;
}

module.exports = { localDateTime, futureExpiryMMYY };
