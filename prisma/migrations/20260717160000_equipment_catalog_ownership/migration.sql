/*
  Warnings:

  - You are about to drop the column `clientId` on the `Equipment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Equipment" DROP CONSTRAINT "Equipment_clientId_fkey";

-- DropIndex
DROP INDEX "Equipment_clientId_createdAt_idx";

-- AlterTable
ALTER TABLE "Equipment" DROP COLUMN "clientId",
ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "isBase" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ClientEquipment" (
    "clientId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientEquipment_pkey" PRIMARY KEY ("clientId","equipmentId")
);

-- CreateIndex
CREATE INDEX "ClientEquipment_clientId_idx" ON "ClientEquipment"("clientId");

-- CreateIndex
CREATE INDEX "Equipment_isBase_name_idx" ON "Equipment"("isBase", "name");

-- CreateIndex
CREATE INDEX "Equipment_createdById_idx" ON "Equipment"("createdById");

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientEquipment" ADD CONSTRAINT "ClientEquipment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientEquipment" ADD CONSTRAINT "ClientEquipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
