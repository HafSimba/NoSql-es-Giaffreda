

import { connectMongo } from '../../../../mongo/connection.js';

export const esercizio01 = async () => {
  try {
    const db = await connectMongo();
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
    
    console.log("\nRisultati:");
    console.log(results);
    
  } catch (error: any) {
    console.error('Errore:', error.message);
  }
};
export default esercizio01;
