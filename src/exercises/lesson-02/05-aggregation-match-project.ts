import { connectToDatabase, closeConnection } from '../../utils/connection.js';

export const esercizio05 = async () => {
  try {
    const db = await connectToDatabase();
    const products = db.collection('products');
    const users = db.collection('users');

    console.log('📝 Esercizio 05: $match e $project\n');

    // A) Pipeline base con $match
    console.log('A) $match - Filtrare prodotti Electronics sotto $500:\n');
    const A = await products.aggregate([
      { $match: { category: 'Electronics', price: { $lt: 500 } } },
      { $limit: 5 }
    ]).toArray();
    A.forEach((p: any, i: number) => console.log(`${i + 1}. ${p.name} - $${(p.price ?? 0).toFixed(2)}`));

    // B) $project per selezionare campi
    console.log('\n\nB) $project - Selezionare solo nome e prezzo:\n');
    const B = await products.aggregate([
      { $match: { status: 'active' } },
      { $project: { _id: 0, name: 1, price: 1 } },
      { $limit: 5 }
    ]).toArray();
    B.forEach((p: any, i: number) => console.log(`${i + 1}. ${p.name} - $${(p.price ?? 0).toFixed(2)}`));

    // C) $project con campi calcolati
    console.log('\n\nC) $project - Creare campo calcolato (sconto 10%):\n');
    const C = await products.aggregate([
      { $match: { price: { $gte: 100 } } },
      { $project: { _id: 0, name: 1, originalPrice: '$price', discountedPrice: { $multiply: ['$price', 0.9] }, savings: { $subtract: ['$price', { $multiply: ['$price', 0.9] }] } } },
      { $limit: 5 }
    ]).toArray();
    C.forEach((p: any, i: number) => console.log(`${i + 1}. ${p.name} - Original: $${(p.originalPrice ?? 0).toFixed(2)}, Discounted: $${(p.discountedPrice ?? 0).toFixed(2)}, Savings: $${(p.savings ?? 0).toFixed(2)}`));

    // D) $project con $concat
    console.log('\n\nD) $project - Creare fullName con $concat:\n');
    const D = await users.aggregate([
      { $match: { role: 'customer' } },
      { $project: { _id: 0, fullName: { $concat: ['$name.first', ' ', '$name.last'] }, email: 1 } },
      { $limit: 5 }
    ]).toArray();
    D.forEach((u: any, i: number) => console.log(`${i + 1}. ${u.fullName} - ${u.email}`));

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await closeConnection();
  }
};

// exported for central runner
