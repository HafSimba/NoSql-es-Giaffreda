import { connectToDatabase, closeConnection } from '../../utils/connection.js';

export const esercizio02 = async () => {
  try {
    const db = await connectToDatabase();
    const products = db.collection('products');
    const users = db.collection('users');

    console.log('📝 Esercizio 02: Projections Nested\n');

    // Parte A: Nested fields nei prodotti
    console.log('A) Prodotti con rating medio:\n');
    const partA = await products
      .find({}, { projection: { name: 1, 'rating.average': 1, 'rating.count': 1, _id: 0 } })
      .limit(5)
      .toArray();
    partA.forEach((p: any, i: number) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   Avg: ${p.rating?.average ?? 'N/A'} (${p.rating?.count ?? 0})`);
    });

    // Parte B: $slice per limitare array
    console.log('\n\nB) Prodotti con primi 3 tags:\n');
    const partB = await products
      .find({}, { projection: { name: 1, tags: { $slice: 3 }, _id: 0 } })
      .limit(5)
      .toArray();
    partB.forEach((p: any, i: number) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   Tags: ${Array.isArray(p.tags) ? p.tags.join(', ') : ''}`);
    });

    // Parte C: Utenti con indirizzo parziale
    console.log('\n\nC) Utenti con città e stato:\n');
    const partC = await users
      .find({ role: 'customer' }, { projection: { 'name.first': 1, 'name.last': 1, 'address.city': 1, 'address.state': 1, _id: 0 } })
      .limit(5)
      .toArray();
    partC.forEach((u: any, i: number) => {
      console.log(`${i + 1}. ${u.name?.first ?? ''} ${u.name?.last ?? ''}`);
      console.log(`   Città: ${u.address?.city ?? 'N/A'}`);
      console.log(`   Stato: ${u.address?.state ?? 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await closeConnection();
  }
};

// exported for central runner
