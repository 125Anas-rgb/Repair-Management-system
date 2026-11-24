-- CreateEnum
CREATE TYPE "ShopStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'CLOSURE_REQUESTED', 'CLOSED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ShopRole" AS ENUM ('SHOP_ADMIN', 'FRONT_DESK', 'TECHNICIAN');

-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('PLATFORM_OWNER');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('RECEIVED', 'DIAGNOSING', 'AWAITING_APPROVAL', 'AWAITING_PARTS', 'REPAIRING', 'QUALITY_CHECK', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED', 'UNREPAIRABLE');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "DeviceCategory" AS ENUM ('PHONE', 'TABLET', 'LAPTOP', 'DESKTOP', 'SMARTWATCH', 'CONSOLE', 'OTHER');

-- CreateEnum
CREATE TYPE "NoteKind" AS ENUM ('DIAGNOSIS', 'REPAIR', 'INTERNAL');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(160),
    "phone" VARCHAR(30) NOT NULL,
    "password_hash" VARCHAR(100) NOT NULL,
    "platform_role" "PlatformRole",
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shops" (
    "id" UUID NOT NULL,
    "shop_code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "normalized_name" VARCHAR(150) NOT NULL,
    "business_reg_no" VARCHAR(60),
    "phone" VARCHAR(30) NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "city" VARCHAR(80) NOT NULL,
    "normalized_city" VARCHAR(80) NOT NULL,
    "status" "ShopStatus" NOT NULL DEFAULT 'ACTIVE',
    "primary_admin_id" UUID,
    "closure_requested_by" UUID,
    "closure_reason" VARCHAR(500),
    "closure_requested_at" TIMESTAMPTZ(6),
    "closed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_members" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "ShopRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "shop_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "shop_id" UUID,
    "token_hash" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "full_name" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "email" VARCHAR(160),
    "user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repair_tickets" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "public_ref" VARCHAR(20) NOT NULL,
    "customer_id" UUID NOT NULL,
    "device_category" "DeviceCategory" NOT NULL,
    "brand" VARCHAR(60) NOT NULL,
    "model" VARCHAR(80) NOT NULL,
    "serial_imei" VARCHAR(60),
    "reported_issue" TEXT NOT NULL,
    "intake_condition" TEXT,
    "accessories" VARCHAR(255),
    "priority" "TicketPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "TicketStatus" NOT NULL DEFAULT 'RECEIVED',
    "assigned_technician_id" UUID,
    "cancel_reason" VARCHAR(500),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "repair_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_photos" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255),
    "mime_type" VARCHAR(80) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "technician_id" UUID NOT NULL,
    "assigned_by" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassigned_at" TIMESTAMPTZ(6),

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_history" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "from_status" "TicketStatus",
    "to_status" "TicketStatus" NOT NULL,
    "actor_id" UUID NOT NULL,
    "reason" VARCHAR(500),
    "customer_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_notes" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "kind" "NoteKind" NOT NULL,
    "body" TEXT NOT NULL,
    "time_spent_minutes" INTEGER,
    "parts_required" VARCHAR(500),
    "is_internal" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_tokens" (
    "id" UUID NOT NULL,
    "shop_id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guest_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "shop_id" UUID,
    "actor_id" UUID,
    "action" VARCHAR(80) NOT NULL,
    "entity" VARCHAR(60) NOT NULL,
    "entity_id" UUID,
    "details" JSONB,
    "ip" VARCHAR(64),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "shops_shop_code_key" ON "shops"("shop_code");

-- CreateIndex
CREATE UNIQUE INDEX "shops_business_reg_no_key" ON "shops"("business_reg_no");

-- CreateIndex
CREATE UNIQUE INDEX "shops_phone_key" ON "shops"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "shops_email_key" ON "shops"("email");

-- CreateIndex
CREATE UNIQUE INDEX "shops_normalized_name_normalized_city_key" ON "shops"("normalized_name", "normalized_city");

-- CreateIndex
CREATE UNIQUE INDEX "shop_members_shop_id_user_id_key" ON "shop_members"("shop_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "customers_shop_id_phone_key" ON "customers"("shop_id", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "repair_tickets_public_ref_key" ON "repair_tickets"("public_ref");

-- CreateIndex
CREATE INDEX "repair_tickets_shop_id_status_idx" ON "repair_tickets"("shop_id", "status");

-- CreateIndex
CREATE INDEX "repair_tickets_shop_id_created_at_idx" ON "repair_tickets"("shop_id", "created_at");

-- CreateIndex
CREATE INDEX "status_history_ticket_id_created_at_idx" ON "status_history"("ticket_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "guest_tokens_token_hash_key" ON "guest_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "audit_logs_shop_id_created_at_idx" ON "audit_logs"("shop_id", "created_at");

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_primary_admin_id_fkey" FOREIGN KEY ("primary_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_closure_requested_by_fkey" FOREIGN KEY ("closure_requested_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_members" ADD CONSTRAINT "shop_members_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_members" ADD CONSTRAINT "shop_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_members" ADD CONSTRAINT "shop_members_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_tickets" ADD CONSTRAINT "repair_tickets_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_tickets" ADD CONSTRAINT "repair_tickets_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_tickets" ADD CONSTRAINT "repair_tickets_assigned_technician_id_fkey" FOREIGN KEY ("assigned_technician_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_tickets" ADD CONSTRAINT "repair_tickets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_photos" ADD CONSTRAINT "ticket_photos_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_photos" ADD CONSTRAINT "ticket_photos_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "repair_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_photos" ADD CONSTRAINT "ticket_photos_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "repair_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "repair_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_notes" ADD CONSTRAINT "ticket_notes_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_notes" ADD CONSTRAINT "ticket_notes_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "repair_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_notes" ADD CONSTRAINT "ticket_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_tokens" ADD CONSTRAINT "guest_tokens_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_tokens" ADD CONSTRAINT "guest_tokens_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "repair_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_tokens" ADD CONSTRAINT "guest_tokens_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
