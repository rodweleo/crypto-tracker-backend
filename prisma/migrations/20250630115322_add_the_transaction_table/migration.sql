/*
  Warnings:

  - You are about to drop the `user_portfolios` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BUY', 'SELL');

-- DropForeignKey
ALTER TABLE "user_portfolios" DROP CONSTRAINT "user_portfolios_user_id_fkey";

-- DropTable
DROP TABLE "user_portfolios";

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "crypto_id" INTEGER NOT NULL,
    "type" "TransactionType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "price_per_unit" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_crypto_id_fkey" FOREIGN KEY ("crypto_id") REFERENCES "crypto_prices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
