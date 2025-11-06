// 02-top-most-discussed.ts

/**
 * FEATURE: Top Film Più Commentati
 * ENDPOINT: GET /api/movies/most-discussed?limit=20
 *
 * PARAMETRI:
 * - limit: numero (numero massimo di film da restituire, default 20)
 *
 * OBIETTIVO:
 * Trovare i film con più commenti e mostrare per ognuno: title, year, poster, genres, imdb.rating, commentCount, lastCommentDate
 * Ordinare per commentCount decrescente e limitare ai top N
 */

import { connectMongo } from '../../../mongo/connection.js';

export const esercizio02 = async () => {
  try {
    const db = await connectMongo();
    const comments = db.collection('comments');

    // Parametri (simulati)
    const limit = 20;

    // Pipeline: partiamo da comments, raggruppiamo per movie_id
    const pipeline: any[] = [
      {
        $group: {
          _id: "$movie_id",
          commentCount: { $sum: 1 },
          lastCommentDate: { $max: "$date" }
        }
      },
      // solo film con almeno 1 commento
      {
        $match: { commentCount: { $gte: 1 } }
      },
      { $sort: { commentCount: -1 } },
      { $limit: limit },
      // lookup dettagli film
      {
        $lookup: {
          from: "movies",
          localField: "_id",
          foreignField: "_id",
          as: "movie"
        }
      },
      { $unwind: "$movie" },
      {
        $project: {
          _id: 0,
          movieId: "$_id",
          title: "$movie.title",
          year: "$movie.year",
          poster: "$movie.poster",
          genres: "$movie.genres",
          "imdb.rating": "$movie.imdb.rating",
          commentCount: 1,
          lastCommentDate: 1
        }
      }
    ];

    console.log('\nQuery:');
    console.log('Pipeline:', JSON.stringify(pipeline, null, 2));

    const results = await comments.aggregate(pipeline).toArray();

    console.log('\nRisultati:');
    console.log(results);

  } catch (error: any) {
    console.error('Errore:', error.message);
  }
};
