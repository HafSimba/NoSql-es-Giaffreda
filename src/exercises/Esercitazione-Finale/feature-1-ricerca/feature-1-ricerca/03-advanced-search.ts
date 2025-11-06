// 03-advanced-search.ts

/**
 * FEATURE: Ricerca Avanzata su Cast e Directors
 * ENDPOINT: GET /api/movies/advanced-search?director=Spielberg&actor=Tom Hanks&minAwards=10
 *
 * PARAMETRI:
 * - director: stringa (regista, match parziale case-insensitive)
 * - actor: stringa (attore nel cast, match parziale case-insensitive)
 * - minAwards: numero (minimo numero di premi vinti)
 *
 * OBIETTIVO:
 * Cercare film per regista e/o attore con filtro su premi.
 * Ordinare per numero di premi vinti (desc) e poi per rating IMDB (desc).
 * Restituire: title, year, directors, cast (primi 3), awards.wins, awards.nominations, imdb.rating, poster
 */

import { connectMongo } from '../../../../mongo/connection.js';

export const esercizio03 = async () => {
  try {
    const db = await connectMongo();
    const movies = db.collection('movies');
    
    // ========================================
    // PARAMETRI (simulati - nel server da req.query)
    // ========================================
    
    const director = "Spielberg";
    const actor = "Tom Hanks";
    const minAwards = 10;
    
    // ========================================
    // COSTRUZIONE FILTRO DINAMICO
    // ========================================
    
    let filter: any = {};
    
    if (director) {
      filter.directors = { $regex: new RegExp(director, "i") };
    }
    
    if (actor) {
      filter.cast = { $regex: new RegExp(actor, "i") };
    }
    
    if (minAwards) {
      filter["awards.wins"] = { $gte: minAwards };
    }
    
    console.log("\nQuery:");
    console.log("Filter:", filter);
    console.log("Projection:", {
      _id: 0,
      title: 1,
      year: 1,
      directors: 1,
      cast: { $slice: 3 },
      "awards.wins": 1,
      "awards.nominations": 1,
      "imdb.rating": 1,
      poster: 1
    });
    console.log("Sort:", { "awards.wins": -1, "imdb.rating": -1 });
    console.log("Limit:", 30);
    
    // ========================================
    // ESECUZIONE QUERY
    // ========================================
    
    const results = await movies
      .find(
        filter,
        {
          projection: {
            _id: 0,
            title: 1,
            year: 1,
            directors: 1,
            cast: { $slice: 3 },
            "awards.wins": 1,
            "awards.nominations": 1,
            "imdb.rating": 1,
            poster: 1
          }
        }
      )
      .sort({ "awards.wins": -1, "imdb.rating": -1 })
      .limit(30)
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
 *   Usiamo $regex per cercare in array di stringhe (directors e cast).
 *   La regex con flag "i" permette il match case-insensitive e parziale.
 *   $slice: 3 nella projection restituisce solo i primi 3 elementi dell'array cast.
 *   Sort multiplo: prima per awards.wins (desc), poi per imdb.rating (desc).
 *
 * - Considerazioni sulle performance:
 *   Le regex su array non sfruttano indici in modo ottimale.
 *   Per migliorare le performance con ricerche frequenti su cast/directors:
 *   - Considerare text index su questi campi
 *   - Oppure normalizzare i dati (tabelle separate per cast/directors)
 *   
 * - ESR Rule (Equality, Sort, Range):
 *   1. Equality: nessun campo equality in questo caso (solo regex)
 *   2. Sort: awards.wins, imdb.rating
 *   3. Range: awards.wins (con $gte)
 *   
 * - Indici suggeriti:
 *   db.movies.createIndex({ "awards.wins": -1, "imdb.rating": -1 })
 *   Questo supporta il sort e il filtro range su awards.wins
 *   
 *   Per ricerche testuali su cast/directors:
 *   db.movies.createIndex({ directors: 1 })
 *   db.movies.createIndex({ cast: 1 })
 */
