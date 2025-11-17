import { connectMongo } from '../../../mongo/connection.js';

// Esercizio 5.1: Ottimizzazione Query Lente
export const esercizio01 = async () => {
  const db = await connectMongo();
  const movies = db.collection('movies');
  const comments = db.collection('comments');
  const users = db.collection('users');
  const applyIndexes = (process.env.APPLY_INDEXES || 'false').toLowerCase() === 'true';

  const createIndexOrSuggest = async (coll: any, spec: any, options: any = {}) => {
    if (applyIndexes) {
      await coll.createIndex(spec, options);
      console.log(`Created index on ${coll.collectionName}: ${JSON.stringify(spec)} ${JSON.stringify(options)}`);
    } else {
      console.log(`Index suggestion for ${coll.collectionName}: createIndex(${JSON.stringify(spec)}, ${JSON.stringify(options)})`);
    }
  };

  // --- QUERY 1: Ricerca Film Recenti per Genere (non ottimizzata)
  const originalPipeline1 = [
    {
      $project: {
        title: 1,
        year: 1,
        genres: 1,
        "imdb.rating": 1,
        runtime: 1,
        cast: 1,
        directors: 1,
        plot: 1,
        poster: 1
      }
    },
    { $unwind: "$genres" },
    { $sort: { "imdb.rating": -1 } },
    { 
      $match: { 
        year: { $gte: 2015 },
        genres: "Action"
      } 
    },
    { $limit: 20 }
  ];

  // Optimized: move $match early, push $sort after match, keep projection last
  const optimizedPipeline1 = [
    { $match: { year: { $gte: 2015 }, genres: "Action" } },
    { $sort: { "imdb.rating": -1 } },
    { $limit: 20 },
    { $project: { _id: 0, title: 1, year: 1, genres: 1, "imdb.rating": 1, poster: 1 } }
  ];

  // Create index to support match+sort: genres (eq) then year (range) then imdb.rating for sort
  // Compound index: { genres:1, year: -1, "imdb.rating": -1 }

  // Explain before
  let explainBefore1: any = null;
  try {
    explainBefore1 = await movies.aggregate(originalPipeline1).explain('executionStats');
  } catch (e: any) {
    explainBefore1 = { error: e?.message ?? String(e) };
  }

  // Create index (opt-in)
  await createIndexOrSuggest(movies, { genres: 1, year: -1, "imdb.rating": -1 }, { name: 'ix_genres_year_rating' });

  // Explain after (optimized pipeline)
  let explainAfter1: any = null;
  try {
    explainAfter1 = await movies.aggregate(optimizedPipeline1).explain('executionStats');
  } catch (e: any) {
    explainAfter1 = { error: e?.message ?? String(e) };
  }

  // --- QUERY 2: Top Commentatori (non ottimizzata)
  const originalPipeline2 = [
    {
      $lookup: {
        from: "users",
        localField: "email",
        foreignField: "email",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "movies",
        localField: "movie_id",
        foreignField: "_id",
        as: "movie"
      }
    },
    { $unwind: "$movie" },
    {
      $group: {
        _id: "$email",
        userName: { $first: "$user.name" },
        commentCount: { $sum: 1 },
        avgMovieRating: { $avg: "$movie.imdb.rating" }
      }
    },
    { $match: { commentCount: { $gte: 5 } } },
    { $sort: { commentCount: -1 } },
    { $limit: 50 }
  ];

  // Optimized: use lookup with pipeline to project only necessary fields, and create indexes on join fields
  const optimizedPipeline2 = [
    {
      $lookup: {
        from: 'users',
        let: { email: '$email' },
        pipeline: [
          { $match: { $expr: { $eq: ['$email', '$$email'] } } },
          { $project: { _id: 0, name: 1, email: 1 } }
        ],
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $lookup: {
        from: 'movies',
        let: { mid: '$movie_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$mid'] } } },
          { $project: { _id: 0, 'imdb.rating': 1 } }
        ],
        as: 'movie'
      }
    },
    { $unwind: '$movie' },
    {
      $group: {
        _id: '$email',
        userName: { $first: '$user.name' },
        commentCount: { $sum: 1 },
        avgMovieRating: { $avg: '$movie.imdb.rating' }
      }
    },
    { $match: { commentCount: { $gte: 5 } } },
    { $sort: { commentCount: -1 } },
    { $limit: 50 }
  ];

  // Create indexes to speed join: users.email, comments.email, comments.movie_id (opt-in)
  await createIndexOrSuggest(users, { email: 1 }, { name: 'ix_users_email' });
  await createIndexOrSuggest(comments, { email: 1 }, { name: 'ix_comments_email' });
  await createIndexOrSuggest(comments, { movie_id: 1 }, { name: 'ix_comments_movie_id' });

  let explainBefore2: any = null;
  let explainAfter2: any = null;
  try {
    explainBefore2 = await comments.aggregate(originalPipeline2).explain('executionStats');
  } catch (e: any) {
    explainBefore2 = { error: e?.message ?? String(e) };
  }
  try {
    explainAfter2 = await comments.aggregate(optimizedPipeline2).explain('executionStats');
  } catch (e: any) {
    explainAfter2 = { error: e?.message ?? String(e) };
  }

  // --- QUERY 3: Film per Decade con Stats (non ottimizzata)
  const originalPipeline3 = [
    { $unwind: "$genres" },
    { $unwind: "$cast" },
    { $unwind: "$directors" },
    {
      $group: {
        _id: {
          decade: { $subtract: ["$year", { $mod: ["$year", 10] }] },
          genre: "$genres"
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.decade": 1 } }
  ];

  // Optimized: only unwind genres (we only need per-genre counts per decade), project year and genres first
  const optimizedPipeline3 = [
    // Normalize year to integer when possible and filter invalid values
    { $addFields: { yearNum: { $convert: { input: '$year', to: 'int', onError: null, onNull: null } } } },
    { $match: { yearNum: { $ne: null } } },
    { $project: { yearNum: 1, genres: 1 } },
    { $unwind: '$genres' },
    {
      $group: {
        _id: {
          decade: { $subtract: ["$yearNum", { $mod: ["$yearNum", 10] }] },
          genre: '$genres'
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.decade': 1 } }
  ];

  // Index to help grouping by genre/year (opt-in)
  await createIndexOrSuggest(movies, { genres: 1, year: 1 }, { name: 'ix_genres_year' });

  let explainBefore3: any = null;
  let explainAfter3: any = null;
  try {
    explainBefore3 = await movies.aggregate(originalPipeline3).explain('executionStats');
  } catch (e: any) {
    explainBefore3 = { error: e?.message ?? String(e) };
  }
  try {
    explainAfter3 = await movies.aggregate(optimizedPipeline3).explain('executionStats');
  } catch (e: any) {
    explainAfter3 = { error: e?.message ?? String(e) };
  }

  // Prepare results summary
  const getExplainStats = (ex: any) => {
    if (!ex) return { error: 'no explain' };
    if (ex.error) return { error: ex.error };
    const stats = ex.executionStats ?? null;
    return {
      executionTimeMillis: stats ? stats.executionTimeMillis : null,
      totalDocsExamined: stats ? stats.totalDocsExamined : null,
      totalKeysExamined: stats ? stats.totalKeysExamined : null
    };
  };

  const results = {
    query1: {
      query: originalPipeline1,
      before: getExplainStats(explainBefore1),
      after: Object.assign({ query: optimizedPipeline1 }, getExplainStats(explainAfter1))
    },
    query2: {
      query: originalPipeline2,
      before: getExplainStats(explainBefore2),
      after: Object.assign({ query: optimizedPipeline2 }, getExplainStats(explainAfter2))
    },
    query3: {
      query: originalPipeline3,
      before: getExplainStats(explainBefore3),
      after: Object.assign({ query: optimizedPipeline3 }, getExplainStats(explainAfter3))
    }
  };

  console.log('Query: ' + JSON.stringify(['query1','query2','query3']));
  console.log('Risultati: ' + JSON.stringify(results, null, 2));
};
