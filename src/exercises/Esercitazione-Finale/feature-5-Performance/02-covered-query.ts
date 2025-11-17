import { connectMongo } from '../../../mongo/connection.js';

// Esercizio 5.2: Covered Query Challenge
export const esercizio02 = async () => {
  const db = await connectMongo();
  const movies = db.collection('movies');
  const applyIndexes = (process.env.APPLY_INDEXES || 'false').toLowerCase() === 'true';

  const createIndexOrSuggest = async (coll: any, spec: any, options: any = {}) => {
    if (applyIndexes) {
      await coll.createIndex(spec, options);
      console.log(`Created index on ${coll.collectionName}: ${JSON.stringify(spec)} ${JSON.stringify(options)}`);
    } else {
      console.log(`Index suggestion for ${coll.collectionName}: createIndex(${JSON.stringify(spec)}, ${JSON.stringify(options)})`);
    }
  };

  // Create a compound index that includes fields used in filter and projection
  // For a covered query filtering by year and genres and projecting title, year, genres
  // Build index: { year: 1, genres: 1, title: 1 }
  await createIndexOrSuggest(movies, { year: 1, genres: 1, title: 1 }, { name: 'ix_year_genres_title' });

  // Example query values
  const yearFilter = parseInt(process.env.COVERED_YEAR || '2010', 10);
  const genreFilter = process.env.COVERED_GENRE || 'Drama';

  const filter = { year: yearFilter, genres: genreFilter };
  const projection = { _id: 0, title: 1, year: 1, genres: 1 };

  // Explain the query
  const explainResult = await movies.find(filter, { projection }).explain('executionStats');

  const results = {
    indexCreated: 'ix_year_genres_title',
    filter,
    projection,
    explain: {
      executionTimeMillis: explainResult.executionStats.executionTimeMillis,
      totalDocsExamined: explainResult.executionStats.totalDocsExamined,
      stage: explainResult.queryPlanner.winningPlan.inputStage ? explainResult.queryPlanner.winningPlan.inputStage.stage : explainResult.queryPlanner.winningPlan.stage
    }
  };

  console.log('Query: ' + JSON.stringify(filter));
  console.log('Risultati: ' + JSON.stringify(results, null, 2));
};
