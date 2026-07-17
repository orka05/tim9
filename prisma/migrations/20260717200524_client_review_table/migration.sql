-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ClientReview" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "trainerId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientReview_clientId_idx" ON "ClientReview"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientReview_trainerId_clientId_key" ON "ClientReview"("trainerId", "clientId");

-- AddForeignKey
ALTER TABLE "ClientReview" ADD CONSTRAINT "ClientReview_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientReview" ADD CONSTRAINT "ClientReview_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
