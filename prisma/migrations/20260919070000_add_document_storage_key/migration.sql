ALTER TABLE "public"."Document" ADD COLUMN "storageKey" TEXT;
ALTER TABLE "public"."Document" ALTER COLUMN "bytes" DROP NOT NULL;