-- CreateEnum
CREATE TYPE "TrainerRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "TrainerRequest" (
    "id" SERIAL NOT NULL,
    "message" VARCHAR(1000) NOT NULL,
    "status" "TrainerRequestStatus" NOT NULL DEFAULT 'PENDING',
    "clientId" INTEGER NOT NULL,
    "trainerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    CONSTRAINT "TrainerRequest_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TrainerRequest_message_check" CHECK (char_length(btrim("message")) BETWEEN 1 AND 1000)
);

-- A client can send a new request after the previous one has been resolved,
-- but cannot have two pending requests for the same trainer.
CREATE UNIQUE INDEX "TrainerRequest_one_pending_per_pair"
ON "TrainerRequest"("clientId", "trainerId")
WHERE "status" = 'PENDING';

-- CreateIndex
CREATE INDEX "TrainerRequest_clientId_createdAt_idx" ON "TrainerRequest"("clientId", "createdAt");
CREATE INDEX "TrainerRequest_trainerId_status_createdAt_idx" ON "TrainerRequest"("trainerId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "TrainerRequest" ADD CONSTRAINT "TrainerRequest_clientId_fkey"
FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TrainerRequest" ADD CONSTRAINT "TrainerRequest_trainerId_fkey"
FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
