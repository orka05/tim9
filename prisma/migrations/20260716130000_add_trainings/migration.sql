-- CreateTable
CREATE TABLE "Training" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "scheduledFor" DATE NOT NULL,
    "trainerId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingBlock" (
    "id" SERIAL NOT NULL,
    "trainingId" INTEGER NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "repetitions" INTEGER NOT NULL,
    "restSeconds" INTEGER NOT NULL,
    "notes" VARCHAR(500) NOT NULL DEFAULT '',
    CONSTRAINT "TrainingBlock_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TrainingBlock_position_check" CHECK ("position" >= 0),
    CONSTRAINT "TrainingBlock_sets_check" CHECK ("sets" BETWEEN 1 AND 100),
    CONSTRAINT "TrainingBlock_repetitions_check" CHECK ("repetitions" BETWEEN 1 AND 1000),
    CONSTRAINT "TrainingBlock_rest_check" CHECK ("restSeconds" BETWEEN 0 AND 3600)
);

-- CreateIndex
CREATE INDEX "Training_trainerId_scheduledFor_idx" ON "Training"("trainerId", "scheduledFor");
CREATE INDEX "Training_clientId_scheduledFor_idx" ON "Training"("clientId", "scheduledFor");
CREATE UNIQUE INDEX "TrainingBlock_trainingId_position_key" ON "TrainingBlock"("trainingId", "position");
CREATE INDEX "TrainingBlock_exerciseId_idx" ON "TrainingBlock"("exerciseId");

-- AddForeignKey
ALTER TABLE "Training" ADD CONSTRAINT "Training_trainerId_fkey"
FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Training" ADD CONSTRAINT "Training_clientId_fkey"
FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrainingBlock" ADD CONSTRAINT "TrainingBlock_trainingId_fkey"
FOREIGN KEY ("trainingId") REFERENCES "Training"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrainingBlock" ADD CONSTRAINT "TrainingBlock_exerciseId_fkey"
FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
