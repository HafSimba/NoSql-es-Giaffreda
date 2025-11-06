// 02-personalized-recommendations.ts
/**
 * FEATURE: Raccomandazioni Personalizzate
 * ENDPOINT: GET /api/recommendations/personalized?email=user@example.com&limit=15
 *
 * Steps:
 * 1) From comments find user's commented movie ids
 * 2) Aggregate commented movies to compute top genres (top 3) and top directors (top 2)
 * 3) Query movies excluding commented ones, filter imdb.rating >= 7.5
 * 4) Compute matches (genreMatch, directorMatch) and priority:
 *    3 => both genre & director, 2 => director only, 1 => genre only
 * 5) Sort by priority desc, then imdb.rating desc, limit N (default 15)
 */
import { connectMongo } from '../../../mongo/connection.js';
import { ObjectId } from 'mongodb';

export const esercizio02 = async () => {
  try {
    const db = await connectMongo();
    const comments = db.collection('comments');
    const movies = db.collection('movies');

    const email = process.env.USER_EMAIL || 'john_bishop@fakegmail.com';
    const limit = Number(process.env.PERSONAL_LIMIT) || 15;

    // 1) get list of movie ids the user commented
    let commentedIdsRaw = await comments.distinct('movie_id', { email });
    // if no results, try case-insensitive email match (some records may vary in case)
    if (!commentedIdsRaw || commentedIdsRaw.length === 0) {
      commentedIdsRaw = await comments.distinct('movie_id', { email: { $regex: `^${email}$`, $options: 'i' } });
      console.log('\nNo comments found with exact email, tried case-insensitive lookup.');
    }

    console.log('\nFound commentedIds count:', (commentedIdsRaw || []).length);
    try {
      console.log('commentedIdsRaw sample:', (commentedIdsRaw || []).slice(0, 5).map((id: any) => ({ value: id, type: typeof id })));
    } catch (e) {}

    // Normalize ids to ObjectId when possible to query movies reliably
    const commentedIds = commentedIdsRaw.map((id: any) => {
      try {
        // if it's a 24-hex string convert to ObjectId
        if (typeof id === 'string' && ObjectId.isValid(id)) return new ObjectId(id);
      } catch (e) {
        // ignore
      }
      return id;
    });

    if (!commentedIds || commentedIds.length === 0) {
      console.log('\nNo commented movies found for user:', email);
      // as a fallback, list a few comments to help debugging
      const sample = await comments.find({ email: { $regex: `^${email}$`, $options: 'i' } }).limit(5).toArray();
      console.log('Sample comments (for debugging):', sample.map(c => ({ _id: c._id, movie_id: c.movie_id, email: c.email })));
      return;
    }

    try {
      console.log('Normalized commentedIds sample:', commentedIds.slice(0, 5).map((id: any) => ({ value: id, type: Object.prototype.toString.call(id) })));
    } catch (e) {}

    // 2) robustly compute top genres and directors from the user's commented movies
  const commentedMovies = await movies.find({ _id: { $in: commentedIds } }, { projection: { genres: 1, directors: 1 } }).toArray();
  console.log('Found commentedMovies count:', commentedMovies.length);
  try { console.log('Sample commentedMovies (debug):', commentedMovies.slice(0,3).map(m=>({ _id: m._id, genres: m.genres, directors: m.directors }))); } catch(e){}

    const genreCounts: Record<string, number> = {};
    const directorCounts: Record<string, number> = {};

    for (const m of commentedMovies) {
      if (Array.isArray(m.genres)) {
        for (const g of m.genres) genreCounts[g] = (genreCounts[g] || 0) + 1;
      }
      if (Array.isArray(m.directors)) {
        for (const d of m.directors) directorCounts[d] = (directorCounts[d] || 0) + 1;
      }
    }

    const preferredGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
    const preferredDirectors = Object.entries(directorCounts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(e => e[0]);

    // 3) Build recommendation pipeline
    const pipeline: any[] = [
      // exclude commented movies and filter by rating
      { $match: { _id: { $nin: commentedIds }, 'imdb.rating': { $gte: 7.5 } } },
      // compute matches
      {
        $addFields: {
          genreMatchCount: { $size: { $setIntersection: [{ $ifNull: ['$genres', []] }, preferredGenres] } },
          directorMatchCount: { $size: { $setIntersection: [{ $ifNull: ['$directors', []] }, preferredDirectors] } }
        }
      },
      // compute priority: 3 = both, 2 = director only, 1 = genre only
      {
        $addFields: {
          priority: {
            $switch: {
              branches: [
                { case: { $and: [{ $gt: ['$genreMatchCount', 0] }, { $gt: ['$directorMatchCount', 0] }] }, then: 3 },
                { case: { $gt: ['$directorMatchCount', 0] }, then: 2 },
                { case: { $gt: ['$genreMatchCount', 0] }, then: 1 }
              ],
              default: 0
            }
          }
        }
      },
      // keep only matches with priority>0
      { $match: { priority: { $gt: 0 } } },
      // sorting by priority then rating
      { $sort: { priority: -1, 'imdb.rating': -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          title: 1,
          year: 1,
          poster: 1,
          'imdb.rating': 1,
          priority: 1,
          matchReasons: {
            $concatArrays: [
              {
                $cond: [ { $gt: ['$genreMatchCount', 0] }, [{ $concat: [{ $toString: '$genreMatchCount' }, ' preferred genres match'] }], [] ]
              },
              { $cond: [ { $gt: ['$directorMatchCount', 0] }, ['Preferred director'], [] ] }
            ]
          }
        }
      }
    ];

    console.log('\nUser email:');
    console.log(email);
    console.log('\nComputed preferences:');
    console.log({ preferredGenres, preferredDirectors });
    console.log('\nQuery:');
    console.log('Pipeline:', JSON.stringify(pipeline, null, 2));

    const results = await movies.aggregate(pipeline).toArray();

    console.log('\nRisultati:');
    console.log(results);

  } catch (error: any) {
    console.error('Errore:', error?.message ?? error);
  }
};
