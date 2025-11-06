// 02-filter-advanced.ts

/**
 * FEATURE: Filtri Avanzati
 * ENDPOINT: GET /api/movies/filter?genre=Drama&yearFrom=2010&yearTo=2020&minRating=7.5&country=USA&page=1
 *
 * PARAMETRI:
 * - genre: stringa (genere del film)
 * - yearFrom: numero (anno minimo)
 * - yearTo: numero (anno massimo)
 * - minRating: numero (rating IMDB minimo)
 * - country: stringa (paese di produzione)
 * - language: stringa (lingua)
 * - page: numero (numero pagina, default 1)
 * - limit: numero (risultati per pagina, default 20)
 * - sortBy: stringa (campo per ordinare, default "imdb.rating")
 * - sortOrder: "asc" | "desc" (default "desc")
 *
 * OBIETTIVO:
 * Filtrare film con criteri multipli opzionali, paginazione e ordinamento configurabile.
 * Restituire: title, year, genres, poster, imdb.rating, countries
 */

import { connectMongo } from '../../../../mongo/connection.js';

export const esercizio02 = async () => {
  try {
    const db = await connectMongo();
    const movies = db.collection('movies');
    
    // ========================================
    // PARAMETRI (simulati - nel server da req.query)
    // ========================================
    
    const genre = "Drama";
    const yearFrom = 2010;
    const yearTo = 2020;
    const minRating = 7.5;
    const country = "USA";
    const language = undefined; // opzionale
    const page = 1;
    const limit = 20;
    const sortBy = "imdb.rating";
    const sortOrder = "desc" as "asc" | "desc";
    
    // ========================================
    // COSTRUZIONE FILTRO DINAMICO
    // ========================================
    
    let filter: any = {};
    
    if (genre) {
      filter.genres = genre;
    }
    
    if (yearFrom || yearTo) {
      filter.year = {};
      if (yearFrom) {
        filter.year.$gte = yearFrom;
      }
      if (yearTo) {
        filter.year.$lte = yearTo;
      }
    }
    
    if (minRating) {
      filter["imdb.rating"] = { $gte: minRating };
    }
    
    if (country) {
      filter.countries = country;
    }
    
    if (language) {
      filter.languages = language;
    }
    
    // ========================================
    // ORDINAMENTO
    // ========================================
    
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    
    // ========================================
    // PAGINAZIONE
    // ========================================
    
    const skip = (page - 1) * limit;
    
    console.log("\nQuery:");
    console.log("Filter:", filter);
    console.log("Projection:", { _id: 0, title: 1, year: 1, genres: 1, poster: 1, "imdb.rating": 1, countries: 1 });
    console.log("Sort:", sort);
    console.log("Skip:", skip);
    console.log("Limit:", limit);
    
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
            genres: 1,
            poster: 1,
            "imdb.rating": 1,
            countries: 1
          }
        }
      )
      .sort(sort)
      .skip(skip)
      .limit(limit)
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
 *   Costruiamo dinamicamente il filtro aggiungendo solo i campi specificati.
 *   Per i range (year, rating) usiamo operatori $gte e $lte.
 *   Per campi array (genres, countries, languages) MongoDB matcha automaticamente.
 *   Paginazione con skip((page-1) * limit) e limit().
 *   Ordinamento dinamico costruendo un oggetto sort.
 *
 * - Considerazioni sulle performance:
 *   Con filtri multipli è importante creare indici compound appropriati.
 *   L'ordine dei campi nell'indice è importante: prima equality, poi range, poi sort.
 *
 * - Indici suggeriti:
 *   db.movies.createIndex({ genres: 1, countries: 1, "imdb.rating": -1, year: -1 })
 *   Questo indice supporta:
 *   - Filter su genres e countries (equality)
 *   - Filter su imdb.rating e year (range)
 *   - Sort su imdb.rating (campo nell'indice)
 */
