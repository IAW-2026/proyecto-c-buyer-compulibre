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

  // 2. Crear Órdenes de compra y sus Carritos correspondientes para que los montos coincidan exactamente
  const orderDistribution = [
    ...Array(6).fill('DELIVERED'),
    ...Array(4).fill('SHIPPED'),
    ...Array(5).fill('PAID'),
    ...Array(3).fill('PENDING_PAYMENT'),
    ...Array(4).fill('CANCELLED'),
    ...Array(3).fill('PAYMENT_FAILED'),
  ] as BuyerOrderStatus[];
  
  for (let i = 0; i < orderDistribution.length; i++) {
    const randomUser = profiles[Math.floor(Math.random() * profiles.length)];
    const orderStatus = orderDistribution[i];
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const amount = Math.floor(Math.random() * 500000) + 10000;
    
    // Mapear el estado de la orden al estado del carrito
    let cartStatus: CartStatus = 'ACTIVE';
    if (['PAID', 'SHIPPED', 'DELIVERED'].includes(orderStatus)) cartStatus = 'CONVERTED';
    else if (orderStatus === 'CANCELLED') cartStatus = 'CANCELLED';
    else if (orderStatus === 'PAYMENT_FAILED') cartStatus = 'REJECTED';

    const cart = await prisma.cart.create({
      data: {
        buyerId: randomUser.id,
        status: cartStatus,
        createdAt: createdAt,
        updatedAt: createdAt,
        items: {
          create: [
            {
              externalProductId: `prod_${Math.floor(Math.random() * 1000)}`,
              productName: `Hardware Component ${i}`,
              quantity: 1,
              cachedPrice: amount, // El precio del carrito coincide exactamente con el de la orden
              sellerId: `seller_seed_${Math.floor(Math.random() * 3)}`,
            }
          ]
        }
      }
    });

    await prisma.buyerOrder.create({
      data: {
        buyerId: randomUser.id,
        sellerId: `seller_seed_${Math.floor(Math.random() * 3)}`,
        totalAmount: amount, // La orden tiene el mismo monto
        status: orderStatus,
        createdAt: createdAt,
        updatedAt: createdAt,
        externalTransactionId: orderStatus !== 'PENDING_PAYMENT' ? `txn_seed_${i}` : null,
        // NOTA ETAPA 3: Estos trackingIds son simulados. Al redirigir a la Shipping App mostrarán "No encontrado" 
        // a menos que se coordinen los seeds con la comisión logística.
        trackingId: ['SHIPPED', 'DELIVERED'].includes(orderStatus) ? `TRK-SEED-${i}` : null,
        courier: ['SHIPPED', 'DELIVERED'].includes(orderStatus) ? 'Andreani' : null,
        shipmentStatus: orderStatus === 'DELIVERED' ? 'DELIVERED' : orderStatus === 'SHIPPED' ? 'IN_TRANSIT' : null,
        cartId: cart.id, // Vinculado correctamente
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
  
  // 3. Crear un par de carritos abandonados extra (sin orden) para mayor realismo
  for (let i = 0; i < 3; i++) {
    const randomUser = profiles[Math.floor(Math.random() * profiles.length)];
    await prisma.cart.create({
      data: {
        buyerId: randomUser.id,
        status: 'ACTIVE',
        items: {
          create: [{
            externalProductId: `prod_abandoned_${i}`,
            productName: `Producto Abandonado ${i}`,
            quantity: 1,
            cachedPrice: Math.floor(Math.random() * 50000) + 5000,
            sellerId: `seller_seed_${Math.floor(Math.random() * 3)}`,
          }]
        }
      }
    });
  }

  console.log('Carritos y Órdenes de compra sincronizados creados');
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
