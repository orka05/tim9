/*
  Warnings:

  - You are about to drop the `Equipment` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ExerciseCategory" AS ENUM ('SPRAVA', 'REKVIZIT', 'BODYWEIGHT');

-- DropForeignKey
ALTER TABLE "Equipment" DROP CONSTRAINT "Equipment_trainerId_fkey";

-- DropTable
DROP TABLE "Equipment";

-- DropEnum
DROP TYPE "EquipmentCategory";

-- CreateTable
CREATE TABLE "Exercise" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" VARCHAR(500) NOT NULL DEFAULT '',
    "category" "ExerciseCategory" NOT NULL DEFAULT 'SPRAVA',
    "trainerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Exercise_trainerId_createdAt_idx" ON "Exercise"("trainerId", "createdAt");

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
