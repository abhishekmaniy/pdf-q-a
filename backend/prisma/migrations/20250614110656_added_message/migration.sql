/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Chat` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pdfId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "OwnerMessage" AS ENUM ('AI', 'USER');

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "createdBy";

-- AlterTable
ALTER TABLE "Pdf" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropEnum
DROP TYPE "OwnerChat";

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "owner" "OwnerMessage" NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chat_pdfId_key" ON "Chat"("pdfId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
