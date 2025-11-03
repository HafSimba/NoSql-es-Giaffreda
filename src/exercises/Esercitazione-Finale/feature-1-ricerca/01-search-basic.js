
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

function mostraRisultati(risultati) {
  console.log("\nRisultati:");
  console.log(risultati);
}

// Funzione principale
async function searchMovies() {
  let client;
  
  try {
    // Connessione a MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI non è configurato nel file .env");
    }
    
    client = new MongoClient(mongoUri);
    await client.connect();
    console.log("Connesso a MongoDB");
    
    const db = client.db('sample_mflix');
    const movies = db.collection('movies');
    
    const term = "godfather"; 
    const regex = new RegExp(term, "i"); 
    
    console.log("\nQuery:");
    console.log("Find:", { title: regex });
    console.log("Projection:", { _id: 0, title: 1, year: 1, poster: 1, "imdb.rating": 1 });
    console.log("Sort:", { "imdb.rating": -1 });
    console.log("Limit:", 20);
    
    const results = await movies
      .find(
        { title: regex },
        { 
          projection: {
            _id: 0,
            title: 1,
            year: 1,
            poster: 1,
            "imdb.rating": 1
          }
        }
      )
      .sort({ "imdb.rating": -1 })
      .limit(20)
      .toArray();

    mostraRisultati(results);
    
  } catch (error) {
    console.error('Errore:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log("\nConnessione chiusa");
    }
  }
}
searchMovies();

