/**
 * Luhn check for card numbers; simulated decline rules for negative testing.
 */
function luhnValid(numStr) {
  const s = String(numStr).replace(/\D/g, '');
  if (s.length < 13 || s.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let n = parseInt(s[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function parseExpiry(mmYY) {
  const m = String(mmYY).replace(/\s/g, '');
  if (!/^\d{4}$/.test(m)) return null;
  const month = parseInt(m.slice(0, 2), 10);
  const year = 2000 + parseInt(m.slice(2, 4), 10);
  if (month < 1 || month > 12) return null;
  return { month, year };
}

function expiryNotPast(mmYY, now = new Date()) {
  const p = parseExpiry(mmYY);
  if (!p) return false;
  const expEnd = new Date(p.year, p.month, 0, 23, 59, 59);
  return expEnd >= now;
}

/** Test-only: known Luhn-valid number that simulates issuer decline */
function shouldDecline(cardNumber) {
  const digits = String(cardNumber).replace(/\D/g, '');
  return digits === '4111111111111111';
}

module.exports = { luhnValid, parseExpiry, expiryNotPast, shouldDecline };
