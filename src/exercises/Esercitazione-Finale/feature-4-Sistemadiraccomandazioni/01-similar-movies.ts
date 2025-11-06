// 01-similar-movies.ts
/**
 * FEATURE: Film Simili
 * ENDPOINT: GET /api/recommendations/similar/:movieId?limit=10
 *
 * Algoritmo:
 * 1) Recupera il film originale (da env MOVIE_ID o cerca un fallback)
 * 2) Costruisce una pipeline usando gli array originali (genres, directors, cast)
 * 3) Calcola score: genres*3, same director 5, cast*2
 * 4) Restituisce top N film (default 10) con matchReasons
 */
import { connectMongo } from '../../../mongo/connection.js';
import { ObjectId } from 'mongodb';

export const esercizio01 = async () => {
  try {
    const db = await connectMongo();
    const movies = db.collection('movies');

    const limit = Number(process.env.RECOMMEND_LIMIT) || 10;
    const movieIdEnv = process.env.MOVIE_ID;

    let original: any = null;
    if (movieIdEnv) {
      try {
        const oid = new ObjectId(movieIdEnv);
        original = await movies.findOne({ _id: oid });
      } catch (e) {
        // not an ObjectId, try as string id (cast to any to satisfy typing)
        original = await movies.findOne({ _id: movieIdEnv as any });
      }
    }

    if (!original) {
      // fallback: pick a well-rated movie with genres/directors/cast
      original = await movies.findOne({
        'imdb.rating': { $gte: 6 },
        genres: { $exists: true, $ne: [] },
        directors: { $exists: true, $ne: [] }
      }, { sort: { 'imdb.rating': -1 } });
    }

    if (!original) {
      console.log('No suitable reference movie found.');
      return;
    }

    const originalId = original._id;
    const originalGenres: string[] = Array.isArray(original.genres) ? original.genres : [];
    const originalDirectors: string[] = Array.isArray(original.directors) ? original.directors : (original.director ? [original.director] : []);
    const originalCast: string[] = Array.isArray(original.cast) ? original.cast : [];

    const pipeline: any[] = [
      // exclude original and filter by rating >= 6
      { $match: { _id: { $ne: originalId }, 'imdb.rating': { $gte: 6 } } },
      // require at least one overlap to narrow candidates (genres/director/cast)
      {
        $match: {
          $expr: {
            $or: [
              { $gt: [{ $size: { $setIntersection: [{ $ifNull: ['$genres', []] }, originalGenres] } }, 0] },
              { $gt: [{ $size: { $setIntersection: [{ $ifNull: ['$directors', []] }, originalDirectors] } }, 0] },
              { $gt: [{ $size: { $setIntersection: [{ $ifNull: ['$cast', []] }, originalCast] } }, 0] }
            ]
          }
        }
      },
      // compute match counts
      {
        $addFields: {
          genresMatchCount: { $size: { $setIntersection: [{ $ifNull: ['$genres', []] }, originalGenres] } },
          directorsMatchCount: { $size: { $setIntersection: [{ $ifNull: ['$directors', []] }, originalDirectors] } },
          castMatchCount: { $size: { $setIntersection: [{ $ifNull: ['$cast', []] }, originalCast] } }
        }
      },
      // compute partial scores
      {
        $addFields: {
          genresScore: { $multiply: ['$genresMatchCount', 3] },
          directorScore: { $cond: [{ $gt: ['$directorsMatchCount', 0] }, 5, 0] },
          castScore: { $multiply: ['$castMatchCount', 2] }
        }
      },
      // total similarity
      {
        $addFields: {
          similarityScore: { $add: ['$genresScore', '$directorScore', '$castScore'] }
        }
      },
      // only keep positive scores
      { $match: { similarityScore: { $gt: 0 } } },
      // build human-readable reasons
      {
        $addFields: {
          matchReasons: {
            $concatArrays: [
              {
                $cond: [
                  { $gt: ['$genresMatchCount', 0] },
                  [{ $concat: [{ $toString: '$genresMatchCount' }, ' genres match'] }],
                  []
                ]
              },
              { $cond: [{ $gt: ['$directorsMatchCount', 0] }, ['Same director'], []] },
              {
                $cond: [
                  { $gt: ['$castMatchCount', 0] },
                  [{ $concat: [{ $toString: '$castMatchCount' }, ' cast members match'] }],
                  []
                ]
              }
            ]
          }
        }
      },
      { $sort: { similarityScore: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          title: 1,
          year: 1,
          poster: 1,
          'imdb.rating': 1,
          similarityScore: 1,
          matchReasons: 1
        }
      }
    ];

    console.log('\nReference movie:');
    console.log({ _id: originalId, title: original.title, year: original.year });
    console.log('\nQuery:');
    console.log('Pipeline:', JSON.stringify(pipeline, null, 2));

    const results = await movies.aggregate(pipeline).toArray();

    console.log('\nRisultati:');
    console.log(results);
  } catch (error: any) {
    console.error('Errore:', error?.message ?? error);
  }
};
