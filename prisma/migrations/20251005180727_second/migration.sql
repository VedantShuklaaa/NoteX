/*
  Warnings:

  - You are about to drop the column `user_id` on the `noteDetails` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."noteDetails" DROP CONSTRAINT "noteDetails_user_id_fkey";

-- DropIndex
DROP INDEX "public"."noteDetails_user_id_key";

-- AlterTable
ALTER TABLE "noteDetails" DROP COLUMN "user_id";
