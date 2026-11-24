const prisma = require('../db');

/**
 * Write one audit log row. Pass a transaction client as `tx` to keep it in the same transaction.
 */
async function audit({ shopId = null, actorId = null, action, entity, entityId = null, details, ip = null }, tx = prisma) {
  await tx.auditLog.create({
    data: { shopId, actorId, action, entity, entityId, details: details ?? undefined, ip },
  });
}

module.exports = { audit };
