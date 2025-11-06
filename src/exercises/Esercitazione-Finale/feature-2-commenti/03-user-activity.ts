// 03-user-activity.ts

/**
 * FEATURE: Cronologia Attività Utente
 * ENDPOINT: GET /api/users/:email/activity
 *
 * PARAMETRI:
 * - email: string (email utente)
 *
 * OBIETTIVO:
 * Raccogliere tutti i commenti di un utente con dettagli film, calcolare statistiche
 * (totale commenti, top 3 generi, top 3 registi, rating medio) e timeline ultimi 50 commenti.
 * Stampare solo la Query (pipeline) e i Risultati.
 */

import { connectMongo } from '../../../mongo/connection.js';

export const esercizio03 = async () => {
  try {
    const db = await connectMongo();
    const comments = db.collection('comments');

    // ======================
    // PARAMETRI (simulati)
    // ======================
    const email = 'john.doe@example.com'; // sostituire con email presente nel DB
    const timelineLimit = 50;

    // ======================
    // AGGREGATION PIPELINE
    // ======================
    const pipeline: any[] = [
      { $match: { email: email } },

      // join con movies
      {
        $lookup: {
          from: 'movies',
          localField: 'movie_id',
          foreignField: '_id',
          as: 'movie'
        }
      },
      { $unwind: '$movie' },

      // facet per parallel analytics
      {
        $facet: {
          statistics: [
            // totale commenti
            { $count: 'totalComments' },
            // genres top
            {
              $lookup: {
                from: 'comments', // reuse comments pipeline: we'll unwind movie.genres from current docs
                pipeline: [],
                as: 'noop'
              }
            }
          ],

          // timeline: ultimi timelineLimit commenti con info film
          timeline: [
            { $sort: { date: -1 } },
            { $limit: timelineLimit },
            {
              $project: {
                _id: 0,
                commentText: '$text',
                commentDate: '$date',
                movieTitle: '$movie.title',
                movieYear: '$movie.year',
                movieRating: '$movie.imdb.rating',
                movieGenres: '$movie.genres',
                movieDirectors: '$movie.directors'
              }
            }
          ],

          // genres aggregation (top 3)
          topGenres: [
            { $unwind: '$movie.genres' },
            { $group: { _id: '$movie.genres', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 }
          ],

          // directors aggregation (top 3)
          topDirectors: [
            { $unwind: '$movie.directors' },
            { $group: { _id: '$movie.directors', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 }
          ],

          // average rating of movies commented
          avgRating: [
            { $group: { _id: null, avgRating: { $avg: '$movie.imdb.rating' } } }
          ]
        }
      },

      // dopo facet, riformattiamo l'output
      {
        $project: {
          statistics: { $arrayElemAt: ['$statistics', 0] },
          timeline: 1,
          topGenres: 1,
          topDirectors: 1,
          avgRating: { $arrayElemAt: ['$avgRating.avgRating', 0] }
        }
      }
    ];

    // NOTE: To keep outputs consistent with other exercises, we print pipeline and results only
    console.log('\nQuery:');
    console.log('Pipeline:', JSON.stringify(pipeline, null, 2));

    const results = await comments.aggregate(pipeline).toArray();

    console.log('\nRisultati:');
    console.log(results[0] ?? null);

  } catch (error: any) {
    console.error('Errore:', error.message);
  }
};
