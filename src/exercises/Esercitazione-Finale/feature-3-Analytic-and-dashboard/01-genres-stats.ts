// 01-genres-stats.ts

/**
 * FEATURE: Statistiche per Genere
 * ENDPOINT: GET /api/analytics/genres-stats
 *
 * OBIETTIVI:
 * Per ogni genere calcolare movieCount, avgRating, avgRuntime, totalAwards, topMovie (title+rating)
 * Ordinare per movieCount decrescente e limitare a top 15
 * Stampare solo la pipeline (Query) e i Risultati
 */

import { connectMongo } from '../../../mongo/connection.js';

export const esercizio01 = async () => {
  try {
    const db = await connectMongo();
    const movies = db.collection('movies');

    const limit = 15;

    const pipeline: any[] = [
      // consider only docs with imdb.rating
      { $match: { "imdb.rating": { $exists: true, $ne: null } } },
      { $unwind: "$genres" },
      // sort by rating desc so $first in group yields top movie
      { $sort: { "imdb.rating": -1 } },
      {
        $group: {
          _id: "$genres",
          movieCount: { $sum: 1 },
          avgRating: { $avg: "$imdb.rating" },
          avgRuntime: { $avg: "$runtime" },
          totalAwards: { $sum: { $ifNull: ["$awards.wins", 0] } },
          topMovieTitle: { $first: "$title" },
          topMovieRating: { $first: "$imdb.rating" }
        }
      },
      {
        $project: {
          _id: 0,
          genre: "$_id",
          movieCount: 1,
          avgRating: { $round: ["$avgRating", 2] },
          avgRuntime: { $round: ["$avgRuntime", 0] },
          totalAwards: 1,
          topMovie: {
            title: "$topMovieTitle",
            rating: "$topMovieRating"
          }
        }
      },
      { $sort: { movieCount: -1 } },
      { $limit: limit }
    ];

    console.log('\nQuery:');
    console.log('Pipeline:', JSON.stringify(pipeline, null, 2));

    const results = await movies.aggregate(pipeline).toArray();

    console.log('\nRisultati:');
    console.log(results);

  } catch (error: any) {
    console.error('Errore:', error.message);
  }
};
