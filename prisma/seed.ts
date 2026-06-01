import { PrismaClient, CartStatus, BuyerOrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando la carga de datos de prueba...');

  // Limpiar SOLO los datos generados por seeds anteriores (para no borrar admins o usuarios reales)
  await prisma.buyerOrderItem.deleteMany({
    where: { order: { buyerId: { startsWith: 'user_seed_' } } }
  });
  await prisma.cartItem.deleteMany({
    where: { cart: { buyerId: { startsWith: 'user_seed_' } } }
  });
  await prisma.buyerOrder.deleteMany({
    where: { buyerId: { startsWith: 'user_seed_' } }
  });
  await prisma.cart.deleteMany({
    where: { buyerId: { startsWith: 'user_seed_' } }
  });
  await prisma.buyerProfile.deleteMany({
    where: { id: { startsWith: 'user_seed_' } }
  });

  // 1. Crear perfiles de prueba
  const profiles = [
    { id: 'user_seed_001', fullName: 'Juan Pérez', address: 'Av. Siempreviva 742', zip: '8109' },
    { id: 'user_seed_002', fullName: 'María Gómez', address: 'Calle Falsa 123', zip: '1428' },
    { id: 'user_seed_003', fullName: 'Carlos López', address: 'Av. Corrientes 456', zip: '1043' },
    { id: 'user_seed_004', fullName: 'Ana Martínez', address: 'Belgrano 789', zip: '2000' },
  ];

  for (const p of profiles) {
    await prisma.buyerProfile.create({
      data: {
        id: p.id,
        fullName: p.fullName,
        defaultShippingAddress: p.address,
        defaultPostalCode: p.zip,
        isActive: true,
      },
    });
  }
  console.log('Perfiles creados');

  // 2. Crear un historial de carritos en distintos estados (Distribución Fija)
  const cartDistribution = [
    ...Array(8).fill('CONVERTED'),
    ...Array(5).fill('ACTIVE'),
    ...Array(4).fill('CANCELLED'),
    ...Array(3).fill('REJECTED'),
  ] as CartStatus[];
  
  const createdCarts = [];
  for (let i = 0; i < cartDistribution.length; i++) {
    const randomUser = profiles[Math.floor(Math.random() * profiles.length)];
    const status = cartDistribution[i];
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

    const cart = await prisma.cart.create({
      data: {
        buyerId: randomUser.id,
        status: status,
        createdAt: createdAt,
        updatedAt: createdAt,
        items: {
          create: [
            {
              externalProductId: `prod_${Math.floor(Math.random() * 1000)}`,
              productName: `Producto Seed ${i}`,
              quantity: Math.floor(Math.random() * 3) + 1,
              cachedPrice: Math.floor(Math.random() * 100000) + 5000,
              sellerId: `seller_seed_${Math.floor(Math.random() * 3)}`,
            }
          ]
        }
      }
    });
    createdCarts.push(cart);
  }
  console.log('Carritos creados');

  // 3. Crear Órdenes de compra (BuyerOrder)
  const orderDistribution = [
    ...Array(6).fill('DELIVERED'),
    ...Array(4).fill('SHIPPED'),
    ...Array(5).fill('PAID'),
    ...Array(3).fill('PENDING_PAYMENT'),
    ...Array(4).fill('CANCELLED'),
    ...Array(3).fill('PAYMENT_FAILED'),
  ] as BuyerOrderStatus[];
  
  // Vamos a usar los carritos CONVERTED para enlazarlos a las órdenes exitosas
  const convertedCarts = createdCarts.filter(c => c.status === 'CONVERTED');
  let convertedCartIndex = 0;

  for (let i = 0; i < orderDistribution.length; i++) {
    const randomUser = profiles[Math.floor(Math.random() * profiles.length)];
    const status = orderDistribution[i];
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const amount = Math.floor(Math.random() * 500000) + 10000;
    
    let linkedCartId = null;
    if (['PAID', 'SHIPPED', 'DELIVERED'].includes(status) && convertedCartIndex < convertedCarts.length) {
      linkedCartId = convertedCarts[convertedCartIndex].id;
      convertedCartIndex++;
    }

    await prisma.buyerOrder.create({
      data: {
        buyerId: randomUser.id,
        sellerId: `seller_seed_${Math.floor(Math.random() * 3)}`,
        totalAmount: amount,
        status: status,
        createdAt: createdAt,
        updatedAt: createdAt,
        externalTransactionId: status !== 'PENDING_PAYMENT' ? `txn_seed_${i}` : null,
        trackingId: ['SHIPPED', 'DELIVERED'].includes(status) ? `TRK-SEED-${i}` : null,
        courier: ['SHIPPED', 'DELIVERED'].includes(status) ? 'Andreani' : null,
        shipmentStatus: status === 'DELIVERED' ? 'DELIVERED' : status === 'SHIPPED' ? 'IN_TRANSIT' : null,
        cartId: linkedCartId,
        items: {
          create: [
            {
              externalProductId: `prod_${Math.floor(Math.random() * 1000)}`,
              productName: `Hardware Component ${i}`,
              quantity: 1,
              unitPrice: amount,
            }
          ]
        }
      }
    });
  }
  console.log('Órdenes de compra creados');
  console.log('Seed finalizado correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
