import { connectMongo } from '../../../mongo/connection.js';

export const esercizio03 = async () => {
  try {
    const db = await connectMongo();
    const movies = db.collection('movies');

    const genre = process.env.HIDDEN_GENRE || process.env.GENRE || '';
    const minRating = parseFloat(process.env.HIDDEN_MIN_RATING || process.env.MIN_RATING || '7.5');
    const limit = parseInt(process.env.HIDDEN_LIMIT || process.env.LIMIT || '20', 10);

    // Build match stage
    const matchStage: any = {
      'imdb.rating': { $gte: minRating }
    };
    if (genre && genre.trim().length > 0) {
      matchStage.genres = genre;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'movie_id',
          as: 'comments'
        }
      },
      {
        $addFields: {
          commentCount: { $size: { $ifNull: ['$comments', []] } }
        }
      },
      {
        $match: {
          commentCount: { $lt: 20, $gt: 0 }
        }
      },
      {
        $addFields: {
          hiddenScore: {
            $multiply: [
              '$imdb.rating',
              { $divide: [1, { $sqrt: '$commentCount' }] }
            ]
          }
        }
      },
      { $sort: { hiddenScore: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          title: 1,
          year: 1,
          genres: 1,
          poster: 1,
          rating: '$imdb.rating',
          commentCount: 1,
          hiddenScore: { $round: ['$hiddenScore', 2] }
        }
      }
    ];

    console.log('Query:');
    console.log(JSON.stringify(pipeline, null, 2));

    const results = await movies.aggregate(pipeline).toArray();

    console.log('\nRisultati:');
    console.log(JSON.stringify(results, null, 2));
  } catch (error: any) {
    console.error('Errore durante l\'esecuzione:', error?.message ?? error);
  }
};
