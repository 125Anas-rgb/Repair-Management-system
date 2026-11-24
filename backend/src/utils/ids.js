const crypto = require('crypto');

// Crockford base32: no I, L, O, U, so codes are easy to read aloud.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function randomCode(length) {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[bytes[i] % 32];
  }
  return out;
}

// Public ticket reference, e.g. RT-7K2M9XQP. Random, never sequential (FR-09).
const newTicketRef = () => `RT-${randomCode(8)}`;

// Public Shop ID, e.g. SHP-4F8K2Q (FR-75).
const newShopCode = () => `SHP-${randomCode(6)}`;

// Raw guest token for tracking links: 32 random bytes (FR-18).
const newGuestToken = () => crypto.randomBytes(32).toString('base64url');

// Opaque refresh token.
const newRefreshToken = () => crypto.randomBytes(48).toString('base64url');

// Only hashes of tokens are stored in the database (FR-19).
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

module.exports = { newTicketRef, newShopCode, newGuestToken, newRefreshToken, sha256 };
