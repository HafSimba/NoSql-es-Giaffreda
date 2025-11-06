// 04-countries-production.ts
/**
 * FEATURE: Produzione Cinematografica per Paese
 * ENDPOINT: GET /api/analytics/countries-production
 *
 * Multi-view using $facet:
 * - overall: top 20 countries by movieCount (movieCount, avgRating)
 * - byDecade: for each decade, top countries by movieCount
 * Also provide per-country topDirectors and topGenres pipelines
 * Print only Query and Risultati (JSON)
 */
import { connectMongo } from '../../../mongo/connection.js';

export const esercizio04 = async () => {
  try {
    const db = await connectMongo();
    const movies = db.collection('movies');

    // base filter: require numeric year and rating
    const pipeline: any[] = [
      {
        $match: {
          year: { $exists: true, $type: 'number' },
          'imdb.rating': { $exists: true, $type: 'number' }
        }
      },
      // compute decade string e.g. '1990s'
      {
        $addFields: {
          decade: {
            $concat: [
              { $toString: { $multiply: [{ $floor: { $divide: ['$year', 10] } }, 10] } },
              's'
            ]
          }
        }
      },
      // facet for multiple views
      {
        $facet: {
          overall: [
            { $unwind: '$countries' },
            {
              $group: {
                _id: '$countries',
                movieCount: { $sum: 1 },
                avgRating: { $avg: '$imdb.rating' }
              }
            },
            { $project: { _id: 0, country: '$_id', movieCount: 1, avgRating: { $round: ['$avgRating', 2] } } },
            { $sort: { movieCount: -1 } },
            { $limit: 20 }
          ],
          // top directors per country
          topDirectors: [
            { $unwind: '$countries' },
            { $unwind: '$directors' },
            {
              $group: {
                _id: { country: '$countries', director: '$directors' },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.country': 1, count: -1 } },
            {
              $group: {
                _id: '$_id.country',
                directors: { $push: { director: '$_id.director', count: '$count' } }
              }
            },
            { $project: { _id: 0, country: '$_id', topDirectors: { $slice: ['$directors', 3] } } }
          ],
          // top genres per country
          topGenres: [
            { $unwind: '$countries' },
            { $unwind: '$genres' },
            {
              $group: {
                _id: { country: '$countries', genre: '$genres' },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.country': 1, count: -1 } },
            {
              $group: {
                _id: '$_id.country',
                genres: { $push: { genre: '$_id.genre', count: '$count' } }
              }
            },
            { $project: { _id: 0, country: '$_id', topGenres: { $slice: ['$genres', 3] } } }
          ],
          // by decade: for each decade, top countries by movieCount
          byDecade: [
            { $unwind: '$countries' },
            {
              $group: {
                _id: { decade: '$decade', country: '$countries' },
                movieCount: { $sum: 1 },
                avgRating: { $avg: '$imdb.rating' }
              }
            },
            {
              $group: {
                _id: '$_id.decade',
                countries: { $push: { country: '$_id.country', movieCount: '$movieCount', avgRating: { $round: ['$avgRating', 2] } } }
              }
            },
            {
              $project: {
                _id: 0,
                decade: '$_id',
                countries: { $slice: [{ $sortArray: { input: '$countries', sortBy: { movieCount: -1 } } }, 10] }
              }
            },
            { $sort: { decade: 1 } }
          ]
        }
      }
    ];

    console.log('\nQuery:');
    console.log('Pipeline:', JSON.stringify(pipeline, null, 2));

    const results = await movies.aggregate(pipeline).toArray();

    console.log('\nRisultati:');
    console.log(JSON.stringify(results[0] ?? {}, null, 2));
  } catch (error: any) {
    console.error('Errore:', error?.message ?? error);
  }
};
