import { connectToDatabase, closeConnection } from '../../utils/connection.js';

export const esercizio03 = async () => {
  try {
    const db = await connectToDatabase();
    const products = db.collection('products');

    console.log('📝 Esercizio 03: Sorting Base\n');

    // A) Sort per prezzo (crescente)
    console.log('A) Prodotti dal più economico al più costoso:\n');
    const A = await products.find({ status: 'active' }).sort({ price: 1 }).limit(5).toArray();
    A.forEach((p: any, i: number) => console.log(`${i + 1}. ${p.name} - $${(p.price ?? 0).toFixed(2)}`));

    // B) Sort per prezzo (decrescente)
    console.log('\n\nB) Top 5 prodotti più costosi:\n');
    const B = await products.find({ status: 'active' }).sort({ price: -1 }).limit(5).toArray();
    B.forEach((p: any, i: number) => console.log(`${i + 1}. ${p.name} - $${(p.price ?? 0).toFixed(2)}`));

    // C) Multi-field sort
    console.log('\n\nC) Prodotti per categoria (A-Z), poi per prezzo (alto-basso):\n');
    const C = await products.find({ status: 'active' }).sort({ category: 1, price: -1 }).limit(50).toArray();
    let currentCategory: string | null = null;
    let counter = 0;
    for (const p of C) {
      if (counter >= 10) break; // enforce overall limit of 10 in output
      if (p.category !== currentCategory) {
        currentCategory = p.category;
        console.log(`\n=== ${currentCategory} ===`);
      }
      console.log(`${counter + 1}. ${p.name} - $${(p.price ?? 0).toFixed(2)}`);
      counter++;
    }

    // D) Sort per nested field (rating)
    console.log('\n\nD) Top 5 prodotti per rating:\n');
    const D = await products.find({ 'rating.count': { $gte: 10 }, status: 'active' }).sort({ 'rating.average': -1 }).limit(5).toArray();
    D.forEach((p: any, i: number) => console.log(`${i + 1}. ${p.name} - Avg: ${p.rating?.average ?? 'N/A'} (${p.rating?.count ?? 0} reviews)`));

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await closeConnection();
  }
};

// exported for central runner
