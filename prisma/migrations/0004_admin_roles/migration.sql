-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'OPS_MANAGER', 'CATALOG_MANAGER');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "adminRole" "AdminRole",
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "User_role_adminRole_idx" ON "User"("role", "adminRole");
