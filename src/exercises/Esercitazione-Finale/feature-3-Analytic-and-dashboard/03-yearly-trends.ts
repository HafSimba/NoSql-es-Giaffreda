// 03-yearly-trends.ts
/**
 * FEATURE: Trend Temporali (yearly trends)
 * ENDPOINT: GET /api/analytics/yearly-trends?fromYear=1990&toYear=2020
 *
 * Per ogni anno calcolare: year, movieCount, avgRating, avgRuntime, topGenres (top 3 con count)
 * Solo film con year, imdb.rating e runtime validi
 * Range di anni configurabile via env FROM_YEAR, TO_YEAR (default ultimi 30 anni)
 */
import { connectMongo } from '../../../mongo/connection.js';

export const esercizio03 = async () => {
  try {
    const db = await connectMongo();
    const movies = db.collection('movies');

    const now = new Date();
    const thisYear = now.getFullYear();
    const defaultFrom = thisYear - 30;
    const fromYear = Number(process.env.FROM_YEAR) || defaultFrom;
    const toYear = Number(process.env.TO_YEAR) || thisYear;

    const pipeline: any[] = [
      // only valid docs with numeric year, rating and runtime
      {
        $match: {
          year: { $exists: true, $type: 'number', $gte: fromYear, $lte: toYear },
          'imdb.rating': { $exists: true, $type: 'number' },
          runtime: { $exists: true, $type: 'number' }
        }
      },
      // unwind genres so we can count genres per year
      { $unwind: { path: '$genres', preserveNullAndEmptyArrays: false } },
      // group by year and genre to count occurrences
      {
        $group: {
          _id: { year: '$year', genre: '$genres' },
          genreCount: { $sum: 1 },
          avgRatingPartial: { $avg: '$imdb.rating' },
          avgRuntimePartial: { $avg: '$runtime' },
          movieCountPartial: { $sum: 1 }
        }
      },
      // regroup to year level: collect genres array and aggregate metrics
      {
        $group: {
          _id: '$_id.year',
          movieCount: { $sum: '$movieCountPartial' },
          avgRating: { $avg: '$avgRatingPartial' },
          avgRuntime: { $avg: '$avgRuntimePartial' },
          genres: {
            $push: { genre: '$_id.genre', count: '$genreCount' }
          }
        }
      },
      // compute top 3 genres by sorting the genres array
      {
        $project: {
          _id: 0,
          year: '$_id',
          movieCount: 1,
          avgRating: { $round: ['$avgRating', 2] },
          avgRuntime: { $round: ['$avgRuntime', 0] },
          topGenres: {
            $slice: [
              { $filter: { input: { $sortArray: { input: '$genres', sortBy: { count: -1 } } }, as: 'g', cond: { $gt: ['$$g.count', 0] } } },
              3
            ]
          }
        }
      },
      // sort by year ascending
      { $sort: { year: 1 } }
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
