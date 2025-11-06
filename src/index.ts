import "dotenv/config.js";
import * as readline from 'readline';
// import { esercizio01 } from './exercises/lesson-02/01-projections-base.js';
// import { esercizio02 } from './exercises/lesson-02/02-projections-nested.js';
// import { esercizio03 } from './exercises/lesson-02/03-sorting-base.js';
// import { esercizio04 } from './exercises/lesson-02/04-sorting-pagination.js';
// import { esercizio05 } from './exercises/lesson-02/05-aggregation-match-project.js';
// import { esercizio06 } from './exercises/lesson-02/06-aggregation-group.js';
import { esercizio01 as esercizioFinale01 } from './exercises/Esercitazione-Finale/feature-1-ricerca/feature-1-ricerca/01-search-basic.js';
import { esercizio02 as esercizioFinale02 } from './exercises/Esercitazione-Finale/feature-1-ricerca/feature-1-ricerca/02-filter-advanced.js';
import { esercizio03 as esercizioFinale03 } from './exercises/Esercitazione-Finale/feature-1-ricerca/feature-1-ricerca/03-advanced-search.js';
import { esercizio01 as esercizioFinale04 } from './exercises/Esercitazione-Finale/feature-2-commenti/01-movie-with-comments.js';
import { esercizio02 as esercizioFinale05 } from './exercises/Esercitazione-Finale/feature-2-commenti/02-top-most-discussed.js';
import { esercizio03 as esercizioFinale06 } from './exercises/Esercitazione-Finale/feature-2-commenti/03-user-activity.js';
import { esercizio01 as esercizioFinale07 } from './exercises/Esercitazione-Finale/feature-3-Analytic-and-dashboard/01-genres-stats.js';
import { esercizio02 as esercizioFinale08 } from './exercises/Esercitazione-Finale/feature-3-Analytic-and-dashboard/02-directors-ranking.js';
import { esercizio03 as esercizioFinale09 } from './exercises/Esercitazione-Finale/feature-3-Analytic-and-dashboard/03-yearly-trends.js';
import { esercizio04 as esercizioFinale10 } from './exercises/Esercitazione-Finale/feature-3-Analytic-and-dashboard/04-countries-production.js';
import { esercizio01 as esercizioFinale11 } from './exercises/Esercitazione-Finale/feature-4-Sistemadiraccomandazioni/01-similar-movies.js';
import { esercizio02 as esercizioFinale12 } from './exercises/Esercitazione-Finale/feature-4-Sistemadiraccomandazioni/02-personalized-recommendations.js';
import { esercizio03 as esercizioFinale13 } from './exercises/Esercitazione-Finale/feature-4-Sistemadiraccomandazioni/03-hidden-gems.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const mostraMenu = () => {
  console.log('\n===========================================');
  console.log('    ESERCITAZIONE FINALE - MENU');
  console.log('===========================================\n');
  console.log('FEATURE 1: RICERCA');
  console.log('  1. Ricerca Base per Titolo');
  console.log('  2. Filtri Avanzati');
  console.log('  3. Ricerca Avanzata su Cast e Directors');
  console.log('\nFEATURE 2: COMMENTI');
  console.log('  4. Film con Commenti');
  console.log('  5. Top film più commentati');
  console.log('  6. Cronologia attività utente');
  console.log('\nFEATURE 3: ANALYTICS E DASHBOARD');
  console.log('  8. Statistiche per Genere');
  console.log('  9. Ranking Registi');
  console.log(' 10. Trend Temporali (Yearly)');
  console.log(' 11. Produzione per Paese');
  console.log(' 12. Film Simili (Recommendations)');
  console.log(' 13. Raccomandazioni Personalizzate');
  console.log(' 14. Gemme Nascoste');
  console.log('\nALTRO');
  console.log('  7. Esegui tutti gli esercizi');
  console.log('  0. Esci');
  console.log('\n===========================================');
};

const eseguiEsercizio = async (scelta: string) => {
  console.log('\n');
  
  switch(scelta) {
    case '1':
      console.log('>>> Esercizio 1.1: Ricerca Base per Titolo\n');
      await esercizioFinale01();
      break;
    case '2':
      console.log('>>> Esercizio 1.2: Filtri Avanzati\n');
      await esercizioFinale02();
      break;
    case '3':
      console.log('>>> Esercizio 1.3: Ricerca Avanzata su Cast e Directors\n');
      await esercizioFinale03();
      break;
    case '4':
      console.log('>>> Esercizio 2.1: Film con Commenti\n');
      await esercizioFinale04();
      break;
    case '5':
      console.log('>>> Esercizio 2.2: Top film più commentati\n');
      await esercizioFinale05();
      break;
    case '6':
      console.log('>>> Esercizio 2.3: Cronologia Attività Utente\n');
      await esercizioFinale06();
      break;
    case '8':
      console.log('>>> Esercizio 3.1: Statistiche per Genere\n');
      await esercizioFinale07();
      break;
    case '9':
      console.log('>>> Esercizio 3.2: Ranking Registi\n');
      await esercizioFinale08();
      break;
    case '10':
      console.log('>>> Esercizio 3.3: Trend Temporali\n');
      await esercizioFinale09();
      break;
    case '11':
      console.log('>>> Esercizio 3.4: Produzione per Paese\n');
      await esercizioFinale10();
      break;
    case '12':
      console.log('>>> Esercizio 4.1: Film Simili\n');
      await esercizioFinale11();
      break;
    case '13':
      console.log('>>> Esercizio 4.2: Raccomandazioni Personalizzate\n');
      await esercizioFinale12();
      break;
    case '14':
      console.log('>>> Esercizio 4.3: Gemme Nascoste\n');
      await esercizioFinale13();
      break;
    case '7':
      console.log('>>> Eseguo tutti gli esercizi...\n');
      console.log('\n--- FEATURE 1: RICERCA ---\n');
      await esercizioFinale01();
      await esercizioFinale02();
      await esercizioFinale03();
      console.log('\n--- FEATURE 2: COMMENTI ---\n');
      await esercizioFinale04();
      await esercizioFinale05();
      await esercizioFinale06();
      // include feature-3 when running all
      await esercizioFinale07();
      await esercizioFinale08();
      await esercizioFinale09();
  await esercizioFinale10();
  await esercizioFinale11();
  await esercizioFinale12();
  await esercizioFinale13();
      break;
    case '0':
      console.log('Uscita...');
      rl.close();
      process.exit(0);
      break;
    default:
      console.log('Scelta non valida. Riprova.');
  }
};

const chiediScelta = () => {
  mostraMenu();
  rl.question('\nScegli un esercizio (0-14): ', async (scelta) => {
    await eseguiEsercizio(scelta.trim());
    
    if (scelta.trim() !== '0') {
      // Dopo aver eseguito un esercizio, mostra di nuovo il menu
      setTimeout(() => chiediScelta(), 100);
    } else {
      rl.close();
      process.exit(0);
    }
  });
};

const main = async () => {
  try {
    chiediScelta();
  } catch (error) {
    console.error('Errore durante l\'esecuzione dell\'esercizio:', error);
    rl.close();
    process.exit(1);
  }
};

main();