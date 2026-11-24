// Values shared by migrations, validation and business rules.

const SHOP_STATUSES = ['PENDING_VERIFICATION', 'ACTIVE', 'CLOSURE_REQUESTED', 'CLOSED', 'SUSPENDED'];

// Roles a user can hold inside one shop (FR-70).
const SHOP_ROLES = ['SHOP_ADMIN', 'FRONT_DESK', 'TECHNICIAN'];

// Platform-level role, separate from shop roles (FR-83 to FR-86).
const PLATFORM_ROLES = ['PLATFORM_OWNER'];

// Repair workflow statuses (FR-25).
const TICKET_STATUSES = [
  'RECEIVED',
  'DIAGNOSING',
  'AWAITING_APPROVAL',
  'AWAITING_PARTS',
  'REPAIRING',
  'QUALITY_CHECK',
  'READY_FOR_PICKUP',
  'COMPLETED',
  'CANCELLED',
  'UNREPAIRABLE',
];

const TICKET_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

const DEVICE_CATEGORIES = ['PHONE', 'TABLET', 'LAPTOP', 'DESKTOP', 'SMARTWATCH', 'CONSOLE', 'OTHER'];

const NOTE_KINDS = ['DIAGNOSIS', 'REPAIR', 'INTERNAL'];

module.exports = {
  SHOP_STATUSES,
  SHOP_ROLES,
  PLATFORM_ROLES,
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  DEVICE_CATEGORIES,
  NOTE_KINDS,
};
