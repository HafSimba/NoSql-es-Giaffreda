// 01-movie-with-comments.ts

/**
 * FEATURE: Film con Commenti
 * ENDPOINT: GET /api/movies/:movieId/with-comments?limit=10
 *
 * PARAMETRI:
 * - movieId: ObjectId (ID del film)
 * - limit: numero (numero massimo di commenti da mostrare, default 10)
 *
 * OBIETTIVO:
 * Mostrare il dettaglio di un film con i suoi commenti più recenti.
 * Includere tutti i campi del film e un array di commenti ordinati per data (più recenti prima).
 * Contare il totale dei commenti (totalComments).
 */

import { connectMongo } from '../../../mongo/connection.js';
import { ObjectId } from 'mongodb';

export const esercizio01 = async () => {
  try {
    const db = await connectMongo();
    const movies = db.collection('movies');
    
    // ========================================
    // PARAMETRI (simulati - nel server da req.params e req.query)
    // ========================================
    
    // Troviamo prima un film che ha commenti
    const filmSample = await movies.findOne({ num_mflix_comments: { $gt: 0 } });
    
    if (!filmSample) {
      return; // nessun output in console se non ci sono film con commenti
    }

    const movieId = filmSample._id;
    const limit = 10;
    
    // ========================================
    // AGGREGATION PIPELINE
    // ========================================
    
    const pipeline = [
      // Match del film specifico
      {
        $match: { _id: movieId }
      },
      
      // Lookup per unire i commenti
      {
        $lookup: {
          from: "comments",
          let: { movieId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$movie_id", "$$movieId"] }
              }
            },
            {
              $sort: { date: -1 }
            },
            {
              $limit: limit
            },
            {
              $project: {
                _id: 0,
                name: 1,
                text: 1,
                date: 1
              }
            }
          ],
          as: "recentComments"
        }
      },
      
      // Lookup per contare tutti i commenti
      {
        $lookup: {
          from: "comments",
          let: { movieId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$movie_id", "$$movieId"] }
              }
            },
            {
              $count: "total"
            }
          ],
          as: "commentCount"
        }
      },
      
      // Aggiungere il campo totalComments
      {
        $addFields: {
          totalComments: {
            $ifNull: [
              { $arrayElemAt: ["$commentCount.total", 0] },
              0
            ]
          }
        }
      },
      
      // Rimuovere il campo temporaneo commentCount
      {
        $project: {
          commentCount: 0
        }
      }
    ];
    
    console.log("\nQuery:");
    console.log("Pipeline:", JSON.stringify(pipeline, null, 2));
    
    const results = await movies.aggregate(pipeline).toArray();

    console.log("\nRisultati:");
    if (results.length > 0) {
      console.log(results[0]);
    } else {
      console.log(null);
    }
    
  } catch (error: any) {
    console.error('Errore:', error.message);
  }
};

/**
 * NOTE:
 * - Spiegazione tecnica:
 *   Usiamo aggregation pipeline con $lookup per unire movies e comments.
 *   La sintassi con pipeline in $lookup permette di ordinare, limitare e proiettare.
 *   Usiamo due $lookup separati: uno per i commenti recenti, uno per il count totale.
 *   $addFields aggiunge il campo totalComments estraendo il valore dal count.
 *
 * - Considerazioni sulle performance:
 *   Il $lookup è un'operazione costosa. È fondamentale avere un indice su comments.movie_id.
 *   L'indice permette a MongoDB di trovare rapidamente i commenti di un film specifico.
 *   
 * - Indici suggeriti:
 *   db.comments.createIndex({ movie_id: 1, date: -1 })
 *   Questo indice supporta:
 *   - Filter su movie_id (equality)
 *   - Sort su date (per i commenti più recenti)
 *
 * - Alternative:
 *   Se il numero di commenti è sempre piccolo, si potrebbe denormalizzare
 *   salvando alcuni commenti direttamente nel documento movie.
 */
