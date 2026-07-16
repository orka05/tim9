-- CreateEnum
CREATE TYPE "TrainerStatus" AS ENUM ('PENDING', 'ACTIVE', 'BANNED');

-- AlterTable
ALTER TABLE "Trainer" ADD COLUMN     "status" "TrainerStatus" NOT NULL DEFAULT 'PENDING';
