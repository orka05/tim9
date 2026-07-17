-- AlterTable
ALTER TABLE "Training"
ADD COLUMN     "trainingRating" INTEGER,
ADD COLUMN     "trainerRating" INTEGER;

-- Add rating range constraints
ALTER TABLE "Training"
ADD CONSTRAINT "Training_trainingRating_check"
CHECK ("trainingRating" IS NULL OR "trainingRating" BETWEEN 1 AND 10);

ALTER TABLE "Training"
ADD CONSTRAINT "Training_trainerRating_check"
CHECK ("trainerRating" IS NULL OR "trainerRating" BETWEEN 1 AND 10);
