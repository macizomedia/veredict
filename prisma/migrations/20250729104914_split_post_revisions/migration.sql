/*
  Warnings:

  - You are about to drop the column `contentBlocks` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `isLatest` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `minRead` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `prompt` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `style` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `summaryOfChanges` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `tone` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `Post` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[currentRevisionId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_parentId_fkey";

-- DropIndex
DROP INDEX "Post_isLatest_idx";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "contentBlocks",
DROP COLUMN "isLatest",
DROP COLUMN "location",
DROP COLUMN "minRead",
DROP COLUMN "parentId",
DROP COLUMN "prompt",
DROP COLUMN "style",
DROP COLUMN "summaryOfChanges",
DROP COLUMN "title",
DROP COLUMN "tone",
DROP COLUMN "version",
ADD COLUMN     "currentRevisionId" INTEGER,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Revision" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "contentBlocks" JSONB,
    "prompt" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "minRead" INTEGER NOT NULL,
    "location" JSONB,
    "summaryOfChanges" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "postId" INTEGER NOT NULL,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Revision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Revision_postId_idx" ON "Revision"("postId");

-- CreateIndex
CREATE INDEX "Revision_version_idx" ON "Revision"("version");

-- CreateIndex
CREATE INDEX "Revision_createdAt_idx" ON "Revision"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Post_currentRevisionId_key" ON "Post"("currentRevisionId");

-- CreateIndex
CREATE INDEX "Post_slug_idx" ON "Post"("slug");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_currentRevisionId_fkey" FOREIGN KEY ("currentRevisionId") REFERENCES "Revision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revision" ADD CONSTRAINT "Revision_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revision" ADD CONSTRAINT "Revision_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Revision"("id") ON DELETE SET NULL ON UPDATE CASCADE;
