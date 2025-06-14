/*
  Warnings:

  - Added the required column `createdAt` to the `Pdf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Pdf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Pdf` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pdf" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL;
