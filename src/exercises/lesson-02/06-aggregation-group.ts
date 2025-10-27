import { connectToDatabase, closeConnection } from '../../utils/connection.js';

export const esercizio06 = async () => {
  try {
    const db = await connectToDatabase();
    const products = db.collection('products');
    const orders = db.collection('orders');

    console.log('📝 Esercizio 06: $group - Raggruppamenti\n');

    // A) Contare prodotti per categoria
    console.log('A) Contare prodotti per categoria:\n');
    const A = await products.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    if (A.length === 0) console.log('Nessuna categoria trovata.');
    A.forEach((row: any, i: number) => {
      console.log(`${i + 1}. ${row._id ?? 'N/A'} - ${row.count} prodotti`);
    });

    // B) Prezzo medio per categoria - Solo prodotti attivi
    console.log('\n\nB) Prezzo medio per categoria (solo prodotti active):\n');
    const B = await products.aggregate([
      { $match: { status: 'active' } },
      { $group: {
        _id: '$category',
        avgPrice: { $avg: { $ifNull: ['$price', 0] } },
        minPrice: { $min: { $ifNull: ['$price', 0] } },
        maxPrice: { $max: { $ifNull: ['$price', 0] } },
        totalProducts: { $sum: 1 }
      } },
      { $sort: { avgPrice: -1 } }
    ]).toArray();
    if (B.length === 0) console.log('Nessuna categoria con prodotti active trovata.');
    B.forEach((row: any, i: number) => {
      console.log(`${i + 1}. ${row._id ?? 'N/A'} - avg: $${(row.avgPrice ?? 0).toFixed(2)}, min: $${(row.minPrice ?? 0).toFixed(2)}, max: $${(row.maxPrice ?? 0).toFixed(2)}, total: ${row.totalProducts}`);
    });

    // C) Statistiche globali
    console.log('\n\nC) Statistiche globali prodotti:\n');
    const C = await products.aggregate([
      { $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        avgPrice: { $avg: { $ifNull: ['$price', 0] } },
        minPrice: { $min: { $ifNull: ['$price', 0] } },
        maxPrice: { $max: { $ifNull: ['$price', 0] } },
        totalInventoryValue: { $sum: { $multiply: [ { $ifNull: ['$price', 0] }, { $ifNull: ['$stock', 0] } ] } }
      } }
    ]).toArray();
    if (C.length === 0) console.log('Nessun prodotto trovato.');
    else {
      const r = C[0] as any;
      console.log(`Totale prodotti: ${r.totalProducts}`);
      console.log(`Prezzo medio: $${(r.avgPrice ?? 0).toFixed(2)}`);
      console.log(`Prezzo minimo: $${(r.minPrice ?? 0).toFixed(2)}`);
      console.log(`Prezzo massimo: $${(r.maxPrice ?? 0).toFixed(2)}`);
      console.log(`Valore totale inventario (price × stock): $${(r.totalInventoryValue ?? 0).toFixed(2)}`);
    }

    // D) Revenue per status ordini
    console.log('\n\nD) Revenue totale per status ordini:\n');
    // Verifichiamo se esiste la collection orders
    const ordersExistsArr = await db.listCollections({ name: 'orders' }).toArray();
    if (ordersExistsArr.length === 0) {
      console.log('Nessuna collection `orders` trovata. Salto la parte D.');
    } else {
      // Calcoliamo orderValue: preferiamo campo `total`, altrimenti somma di items.price * quantity
      const D = await orders.aggregate([
        { $addFields: {
          orderValue: {
            $ifNull: [
              '$total',
              { $sum: {
                $map: {
                  input: { $ifNull: ['$items', []] },
                  as: 'it',
                  in: { $multiply: [ { $ifNull: ['$$it.price', 0] }, { $ifNull: ['$$it.quantity', 1] } ] }
                }
              } }
            ]
          }
        } },
        { $group: {
          _id: '$status',
          totalRevenue: { $sum: { $ifNull: ['$orderValue', 0] } },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: { $ifNull: ['$orderValue', 0] } }
        } },
        { $sort: { totalRevenue: -1 } }
      ]).toArray();
      if (D.length === 0) console.log('Nessun ordine trovato.');
      D.forEach((row: any, i: number) => {
        console.log(`${i + 1}. Status: ${row._id ?? 'N/A'} - Revenue: $${(row.totalRevenue ?? 0).toFixed(2)}, Orders: ${row.orderCount}, Avg: $${(row.avgOrderValue ?? 0).toFixed(2)}`);
      });
    }

    // E) Brands per categoria (usa $addToSet) - solo prodotti con brand esistente
    console.log('\n\nE) Brands per categoria:\n');
    const E = await products.aggregate([
      { $match: { brand: { $exists: true, $ne: null } } },
      { $group: { _id: '$category', brands: { $addToSet: '$brand' } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    if (E.length === 0) console.log('Nessuna categoria con brand trovata.');
    E.forEach((row: any, i: number) => {
      console.log(`${i + 1}. ${row._id ?? 'N/A'} - Brands: ${Array.isArray(row.brands) ? row.brands.join(', ') : 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await closeConnection();
  }
};

// export for central runner
