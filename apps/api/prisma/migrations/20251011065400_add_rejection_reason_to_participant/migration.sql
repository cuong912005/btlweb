-- AlterTable
ALTER TABLE "event_participants" ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "rated_at" TIMESTAMP(3),
ADD COLUMN     "rating" INTEGER,
ADD COLUMN     "rejection_reason" TEXT;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by" TEXT,
ADD COLUMN     "rejection_reason" TEXT;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
