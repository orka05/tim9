-- CreateEnum
CREATE TYPE "EquipmentCategory" AS ENUM ('KARDIO', 'TEGOVI', 'MASINE', 'FUNKCIONALNI_TRENING', 'OSTALO');

-- CreateTable
CREATE TABLE "Equipment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" VARCHAR(500) NOT NULL DEFAULT '',
    "category" "EquipmentCategory" NOT NULL DEFAULT 'OSTALO',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "trainerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Equipment_trainerId_createdAt_idx" ON "Equipment"("trainerId", "createdAt");

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_trainerId_fkey"
FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;