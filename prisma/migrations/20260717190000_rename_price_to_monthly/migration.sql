-- Preimenovanje kolone cene trenera: sada predstavlja mesečnu cenu, a ne po treningu.
ALTER TABLE "Trainer" RENAME COLUMN "pricePerSession" TO "pricePerMonth";
