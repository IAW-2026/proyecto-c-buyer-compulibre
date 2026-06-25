-- CreateEnum
CREATE TYPE "CartStatus" AS ENUM ('ACTIVE', 'ABANDONED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "BuyerOrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'PAYMENT_FAILED');

-- CreateTable
CREATE TABLE "BuyerProfile" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "defaultShippingAddress" TEXT,

    CONSTRAINT "BuyerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "status" "CartStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "externalProductId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "cachedPrice" DECIMAL(65,30) NOT NULL,
    "sellerId" TEXT NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerOrder" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "status" "BuyerOrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "externalTransactionId" TEXT,
    "trackingId" TEXT,
    "courier" TEXT,
    "shipmentStatus" TEXT,

    CONSTRAINT "BuyerOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerOrderItem" (
    "id" TEXT NOT NULL,
    "buyerOrderId" TEXT NOT NULL,
    "externalProductId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "BuyerOrderItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "BuyerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerOrder" ADD CONSTRAINT "BuyerOrder_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "BuyerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerOrderItem" ADD CONSTRAINT "BuyerOrderItem_buyerOrderId_fkey" FOREIGN KEY ("buyerOrderId") REFERENCES "BuyerOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
