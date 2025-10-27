import "dotenv/config.js";
import { esercizio01 } from './exercises/lesson-02/01-projections-base.js';

const main = async () => {
  try {
    await esercizio01();
  } catch (error) {
    console.error('Errore durante l\'esecuzione dell\'esercizio:', error);
  } finally {
    process.exit(0);
  }
};

main();