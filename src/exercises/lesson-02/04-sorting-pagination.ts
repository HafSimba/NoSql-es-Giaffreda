import { connectToDatabase, closeConnection } from '../../utils/connection.js';

export const esercizio04 = async () => {
  try {
    const db = await connectToDatabase();
    const products = db.collection('products');

    console.log('📝 Esercizio 04: Sorting con Pagination\n');

    // Parte A: Pagination base
    const PAGE_SIZE = 5;
    const currentPage = 2;
    
    // Calcola skip
    const skip = (currentPage - 1) * PAGE_SIZE;

    // Query con skip e limit, ordinando per name asc
    const pageData = await products.find({}).sort({ name: 1 }).skip(skip).limit(PAGE_SIZE).toArray();

    // Conta totale documenti
    const totalDocs = await products.countDocuments({});

    // Calcola totalPages
    const totalPages = Math.ceil(totalDocs / PAGE_SIZE);

    console.log(`Pagina ${currentPage} di ${totalPages} (totale documenti: ${totalDocs})\n`);
    pageData.forEach((p: any, i: number) => console.log(`${skip + i + 1}. ${p.name}`));

    // Parte B: Funzione riutilizzabile
    const paginate = async (page: number, pageSize: number) => {
      const skipLocal = (page - 1) * pageSize;
      const [docs, total] = await Promise.all([
        products.find({}).sort({ name: 1 }).skip(skipLocal).limit(pageSize).toArray(),
        products.countDocuments({})
      ]);
      const totalPagesLocal = Math.max(1, Math.ceil(total / pageSize));
      return {
        data: docs,
        pagination: {
          currentPage: page,
          pageSize,
          totalDocuments: total,
          totalPages: totalPagesLocal,
          hasNextPage: page < totalPagesLocal,
          hasPrevPage: page > 1
        }
      };
    };

    // Testa la funzione con pagina 3
    const page3 = await paginate(3, PAGE_SIZE);
    console.log('\nEsempio paginate pagina 3:\n', page3.pagination);
    page3.data.forEach((p: any, i: number) => console.log(`${(3 - 1) * PAGE_SIZE + i + 1}. ${p.name}`));

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await closeConnection();
  }
};

// exported for central runner
