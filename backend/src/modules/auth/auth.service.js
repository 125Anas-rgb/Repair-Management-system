const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../db');
const env = require('../../config/env');
const { newRefreshToken, sha256 } = require('../../utils/ids');
const { unauthorized } = require('../../utils/http');
const { audit } = require('../../utils/audit');

const publicUser = (u) => ({
  id: u.id,
  fullName: u.fullName,
  email: u.email,
  phone: u.phone,
  platformRole: u.platformRole,
});

async function getMemberships(userId, tx = prisma) {
  const rows = await tx.shopMember.findMany({
    where: { userId, isActive: true },
    include: { shop: { select: { id: true, shopCode: true, name: true, status: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return rows.map((m) => ({
    role: m.role,
    shopId: m.shop.id,
    shopCode: m.shop.shopCode,
    shopName: m.shop.name,
    shopStatus: m.shop.status,
  }));
}

/**
 * Create an access token (short-lived JWT) and a refresh token (random, stored only as a hash).
 */
async function issueTokens(user, shopId, tx = prisma) {
  const accessToken = jwt.sign({ sub: user.id, shopId: shopId || null }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpires,
  });
  const refreshToken = newRefreshToken();
  await tx.refreshToken.create({
    data: {
      userId: user.id,
      shopId: shopId || null,
      tokenHash: sha256(refreshToken),
      expiresAt: new Date(Date.now() + env.jwt.refreshDays * 24 * 60 * 60 * 1000),
    },
  });
  return { accessToken, refreshToken };
}

async function buildSession(user, shopId, tx = prisma) {
  const memberships = await getMemberships(user.id, tx);
  // Use the requested shop if the user belongs to it, otherwise the first one.
  const active = memberships.find((m) => m.shopId === shopId) || memberships[0] || null;
  const tokens = await issueTokens(user, active?.shopId, tx);
  return { ...tokens, user: publicUser(user), memberships, activeShop: active };
}

async function login({ email, password, shopId }, ip) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  // Same message for wrong email or wrong password, so attackers cannot probe accounts.
  const ok = user && user.isActive && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) throw unauthorized('Email or password is incorrect.');

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const session = await buildSession(user, shopId);
  await audit({ shopId: session.activeShop?.shopId, actorId: user.id, action: 'LOGIN', entity: 'user', entityId: user.id, ip });
  return session;
}

/**
 * Swap a valid refresh token for a new pair. The old refresh token is revoked (rotation),
 * so a stolen token can be used at most once.
 */
async function refresh({ refreshToken, shopId }) {
  return prisma.$transaction(async (tx) => {
    // Revoke only if still active: two parallel refreshes cannot both succeed.
    const revoked = await tx.refreshToken.updateMany({
      where: { tokenHash: sha256(refreshToken), revokedAt: null, expiresAt: { gt: new Date() } },
      data: { revokedAt: new Date() },
    });
    if (revoked.count !== 1) throw unauthorized('Session expired. Please sign in again.');

    const row = await tx.refreshToken.findUnique({ where: { tokenHash: sha256(refreshToken) }, include: { user: true } });
    if (!row.user.isActive) throw unauthorized('Account is not active.');
    return buildSession(row.user, shopId || row.shopId, tx);
  });
}

async function logout({ refreshToken }) {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: sha256(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

async function me(userCtx) {
  const user = await prisma.user.findUnique({ where: { id: userCtx.id } });
  const memberships = await getMemberships(user.id);
  const activeShop = memberships.find((m) => m.shopId === userCtx.shopId) || null;
  return { user: publicUser(user), memberships, activeShop };
}

module.exports = { login, refresh, logout, me, buildSession, publicUser };
