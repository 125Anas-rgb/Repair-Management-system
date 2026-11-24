/**
 * Demo data for development and the 10 December demo.
 * Run with: npm run db:seed
 * All demo accounts use the password: Password@123
 */
const bcrypt = require('bcryptjs');
const prisma = require('../src/db');

const PASSWORD = 'Password@123';

async function main() {
  // Clear in dependency order (children first).
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.guestToken.deleteMany(),
    prisma.ticketNote.deleteMany(),
    prisma.statusHistory.deleteMany(),
    prisma.assignment.deleteMany(),
    prisma.ticketPhoto.deleteMany(),
    prisma.repairTicket.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.shopMember.deleteMany(),
    prisma.shop.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const user = (fullName, email, phone, extra = {}) =>
    prisma.user.create({ data: { fullName, email, phone, passwordHash, ...extra } });

  const owner = await user('Platform Owner', 'owner@repairtrack.app', '43204789230947', { platformRole: 'PLATFORM_OWNER' });
  const admin = await user('Ali Raza', 'admin@citymobile.pk', '03001234567');
  const desk = await user('Sara Khan', 'desk@citymobile.pk', '03007654321');
  const tech = await user('Usman Tariq', 'tech@citymobile.pk', '03111234567');
  const admin2 = await user('Bilal Ahmed', 'admin@fixitlab.pk', '03211234567');

  await prisma.shop.create({
    data: {
      shopCode: 'SHP-CITY01',
      name: 'City Mobile Repair',
      normalizedName: 'city mobile repair',
      businessRegNo: 'NTN-1234567',
      phone: '0421234567',
      email: 'contact@citymobile.pk',
      address: 'Shop 12, Hall Road',
      city: 'Lahore',
      normalizedCity: 'lahore',
      primaryAdminId: admin.id,
      members: {
        create: [
          { userId: admin.id, role: 'SHOP_ADMIN' },
          { userId: desk.id, role: 'FRONT_DESK', createdBy: admin.id },
          { userId: tech.id, role: 'TECHNICIAN', createdBy: admin.id },
        ],
      },
    },
  });

  await prisma.shop.create({
    data: {
      shopCode: 'SHP-FIXIT2',
      name: 'FixIt Lab',
      normalizedName: 'fixit lab',
      businessRegNo: 'NTN-7654321',
      phone: '0517654321',
      email: 'hello@fixitlab.pk',
      address: 'Blue Area, Plaza 4',
      city: 'Islamabad',
      normalizedCity: 'islamabad',
      primaryAdminId: admin2.id,
      members: { create: [{ userId: admin2.id, role: 'SHOP_ADMIN' }] },
    },
  });

  console.log(`Seeded 2 shops and 5 users. Password for all: ${PASSWORD}. Platform owner: ${owner.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
