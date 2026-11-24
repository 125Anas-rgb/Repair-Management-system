const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../db');
const { unauthorized, forbidden } = require('../utils/http');

/**
 * Checks the Bearer access token and loads the user's current shop membership.
 * Sets req.user = { id, fullName, email, platformRole, shopId, role }.
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) throw unauthorized('Missing access token.');

    let payload;
    try {
      payload = jwt.verify(token, env.jwt.accessSecret);
    } catch (err) {
      throw unauthorized(err.name === 'TokenExpiredError' ? 'Access token expired.' : 'Invalid access token.');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) throw unauthorized('Account is not active.');

    req.user = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      platformRole: user.platformRole,
      shopId: null,
      role: null,
    };

    // Membership is re-checked on every request, so a deactivated staff account loses access at once.
    if (payload.shopId) {
      const member = await prisma.shopMember.findFirst({
        where: { shopId: payload.shopId, userId: user.id, isActive: true },
      });
      if (member) {
        req.user.shopId = member.shopId;
        req.user.role = member.role;
      }
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * Allow only the listed shop roles. Every protected shop route uses this (FR-05, FR-07).
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return next(unauthorized());
  if (!req.user.shopId) return next(forbidden('Register or join a shop first.'));
  if (!roles.includes(req.user.role)) return next(forbidden());
  return next();
};

const requirePlatformOwner = (req, res, next) => {
  if (req.user?.platformRole !== 'PLATFORM_OWNER') return next(forbidden());
  return next();
};

module.exports = { requireAuth, requireRole, requirePlatformOwner };
