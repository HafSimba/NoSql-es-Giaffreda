import "dotenv/config.js";
import { esercizio01 } from './exercises/lesson-02/01-projections-base.js';
import { esercizio02 } from './exercises/lesson-02/02-projections-nested.js';
import { esercizio03 } from './exercises/lesson-02/03-sorting-base.js';
import { esercizio04 } from './exercises/lesson-02/04-sorting-pagination.js';
import { esercizio05 } from './exercises/lesson-02/05-aggregation-match-project.js';
import { esercizio06 } from './exercises/lesson-02/06-aggregation-group.js';

const main = async () => {
  try {
  await esercizio01();
  await esercizio02();
  await esercizio03();
  await esercizio04();
  await esercizio05();
  await esercizio06();
  } catch (error) {
    console.error('Errore durante l\'esecuzione dell\'esercizio:', error);
  } finally {
    process.exit(0);
  }
};

main();