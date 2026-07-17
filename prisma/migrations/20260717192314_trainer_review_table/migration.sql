/*
  Warnings:

  - You are about to drop the column `trainerRating` on the `Training` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Training" DROP COLUMN "trainerRating";

-- CreateTable
CREATE TABLE "TrainerReview" (
    "id" SERIAL NOT NULL,
    "trainerId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainerReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainerReview_trainerId_idx" ON "TrainerReview"("trainerId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerReview_trainerId_clientId_key" ON "TrainerReview"("trainerId", "clientId");

-- AddForeignKey
ALTER TABLE "TrainerReview" ADD CONSTRAINT "TrainerReview_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerReview" ADD CONSTRAINT "TrainerReview_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
