// 01-search-basic.ts

/**
 * FEATURE: Ricerca Base per Titolo
 * ENDPOINT: GET /api/movies/search?term=godfather
 *
 * PARAMETRI:
 * - term: stringa (titolo parziale da cercare)
 *
 * OBIETTIVO:
 * Ricerca case-insensitive sul campo `title` con match parziale.
 * Restituire solo i campi necessari per la card film: title, year, poster, rating
 * Ordinare per rating IMDB discendente e limitare a 20 risultati.
 */

import { connectMongo } from '../../../mongo/connection.js';

export const esercizio01 = async () => {
  try {
    const db = await connectMongo();
    const movies = db.collection('movies');
    
    // ========================================
    // LA TUA QUERY QUI
    // ========================================
    
    const term = "godfather";
    const regex = new RegExp(term, "i");
    
    console.log("\nQuery:");
    console.log("Find:", { title: regex });
    console.log("Projection:", { _id: 0, title: 1, year: 1, poster: 1, "imdb.rating": 1 });
    console.log("Sort:", { "imdb.rating": -1 });
    console.log("Limit:", 20);
    
    const results = await movies
      .find(
        { title: regex },
        { 
          projection: {
            _id: 0,
            title: 1,
            year: 1,
            poster: 1,
            "imdb.rating": 1
          }
        }
      )
      .sort({ "imdb.rating": -1 })
      .limit(20)
      .toArray();
    
    console.log("\nRisultati:");
    console.log(results);
    
  } catch (error: any) {
    console.error('Errore:', error.message);
  }
};

/**
 * NOTE:
 * - Spiegazione tecnica:
 *   Usiamo find() per cercare i film con una regex sul campo title.
 *   La regex con flag "i" permette il match case-insensitive e parziale.
 *   La proiezione seleziona solo i campi richiesti.
 *   Usiamo sort() per ordinare per rating IMDB decrescente e limit() per max 20 risultati.
 *
 * - Considerazioni sulle performance:
 *   Le regex non ancorate (es. /term/i) non sfruttano indici e possono causare
 *   scansioni full collection su grandi dataset. Per una ricerca più performante
 *   considerare la creazione di un indice text sul campo title.
 *
 * - Indici suggeriti:
 *   - Per ordinamento efficiente: db.movies.createIndex({ "imdb.rating": -1 })
 *   - Per ricerche testuali: db.movies.createIndex({ title: "text" })
 */
