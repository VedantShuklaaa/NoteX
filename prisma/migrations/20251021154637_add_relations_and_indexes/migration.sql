/*
  Warnings:

  - Changed the type of `imageSize` on the `noteDetails` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "noteDetails" ADD COLUMN     "imageKey" TEXT NOT NULL DEFAULT 'publicIMG',
DROP COLUMN "imageSize",
ADD COLUMN     "imageSize" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "fetchDetails" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessedBy" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,

    CONSTRAINT "fetchDetails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "noteDetails" ADD CONSTRAINT "noteDetails_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fetchDetails" ADD CONSTRAINT "fetchDetails_accessedBy_fkey" FOREIGN KEY ("accessedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fetchDetails" ADD CONSTRAINT "fetchDetails_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "noteDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;
