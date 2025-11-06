// 02-directors-ranking.ts
/**
 * FEATURE: Ranking Registi
 * ENDPOINT: GET /api/analytics/directors-ranking?minMovies=3
 *
 * Per ogni regista calcolare: director, movieCount, avgRating, totalAwards, bestMovie, genres
 * Filtrare registi con almeno N film (default 3)
 * Ordinare per avgRating desc, poi movieCount desc
 * Limit 20
 */
import { connectMongo } from '../../../mongo/connection.js';

export const esercizio02 = async () => {
  try {
    const db = await connectMongo();
    const movies = db.collection('movies');

    // read minMovies from env if provided (simulates query param), default 3
    const minMovies = Number(process.env.MIN_MOVIES) || 3;
    const limit = 20;

    const pipeline: any[] = [
      // only consider docs with imdb.rating
      { $match: { 'imdb.rating': { $exists: true, $ne: null } } },
      { $unwind: '$directors' },
      // sort by rating desc so $first in group is the best movie
      { $sort: { 'imdb.rating': -1 } },
      {
        $group: {
          _id: '$directors',
          movieCount: { $sum: 1 },
          avgRating: { $avg: '$imdb.rating' },
          totalAwards: { $sum: { $ifNull: ['$awards.wins', 0] } },
          bestMovieTitle: { $first: '$title' },
          bestMovieRating: { $first: '$imdb.rating' },
          genresArrays: { $push: '$genres' } // collect arrays to flatten later
        }
      },
      // filter directors with at least minMovies
      { $match: { movieCount: { $gte: minMovies } } },
      {
        $project: {
          _id: 0,
          director: '$_id',
          movieCount: 1,
          avgRating: { $round: ['$avgRating', 2] },
          totalAwards: 1,
          bestMovie: { title: '$bestMovieTitle', rating: '$bestMovieRating' },
          // flatten and unique genres arrays
          genres: {
            $reduce: {
              input: '$genresArrays',
              initialValue: [],
              in: { $setUnion: ['$$value', '$$this'] }
            }
          }
        }
      },
      // sort by avgRating desc, then movieCount desc
      { $sort: { avgRating: -1, movieCount: -1 } },
      { $limit: limit }
    ];

    console.log('\nQuery:');
    console.log('Pipeline:', JSON.stringify(pipeline, null, 2));

    const results = await movies.aggregate(pipeline).toArray();

    console.log('\nRisultati:');
    console.log(results);
  } catch (error: any) {
    console.error('Errore:', error?.message ?? error);
  }
};
