
LEZIONE 07 

1.1 INSERISCI PRODOTTO CON ARRAY DI TAG
db.products.insertOne({ sku: "CAMERA-CANON-EOS-R5", name: "Canon EOS R5", category: "Electronics", price: 3899.00, tags: ["camera", "professional", "mirrorless", "4k", "canon"], features: ["45MP sensor", "8K video", "IBIS", "Dual card slots"], status: "active" })

1.2 INSERISCI UTENTE CON ARRAY DI INTERESSI
db.users.insertOne({ name: { first: "Lisa", last: "Chen" }, email: "lisa.chen@example.com", interests: ["photography", "travel", "technology", "cooking"], favoriteProducts: [], role: "customer", status: "active" })

2.1 TROVA PRODOTTI TAGGATI 'camera'
db.products.find({ tags: "camera" })

2.2 TROVA PRODOTTI CON QUALSIASI DI PIU' TAG
db.products.find({ tags: { $in: ["sale", "clearance", "discount"] } })

2.3 TROVA PRODOTTI CHE CONTENGONO TUTTI I TAG SPECIFICATI
db.products.find({ tags: { $all: ["wireless", "premium"] } })

2.4 TROVA PRODOTTI CON ESATTAMENTE 5 TAG
db.products.find({ tags: { $size: 5 } })

2.5 TROVA UTENTI SENZA PRODOTTI PREFERITI
db.users.find({ favoriteProducts: { $size: 0 } })

3.1 AGGIUNGI TAG 'featured' (PUSH)
db.products.updateOne({ sku: "CAMERA-CANON-EOS-R5" }, { $push: { tags: "featured" } })

3.2 AGGIUNGI PIU' TAG CON $each
db.products.updateOne({ sku: "CAMERA-CANON-EOS-R5" }, { $push: { tags: { $each: ["new-arrival", "bestseller"] } } })

3.3 AGGIUNGI TAG UNICO CON $addToSet
db.products.updateOne({ sku: "CAMERA-CANON-EOS-R5" }, { $addToSet: { tags: "premium" } })

3.4 AGGIUNGI PIU' TAG UNICI
db.products.updateOne({ sku: "CAMERA-CANON-EOS-R5" }, { $addToSet: { tags: { $each: ["high-end", "recommended"] } } })

4.1 RIMUOVI ELEMENTO SPECIFICO ($pull)
db.products.updateOne({ sku: "CAMERA-CANON-EOS-R5" }, { $pull: { tags: "featured" } })

4.2 RIMUOVI PIU' ELEMENTI
db.products.updateOne({ sku: "CAMERA-CANON-EOS-R5" }, { $pull: { tags: { $in: ["new-arrival", "sale"] } } })

4.3 RIMUOVI ULTIMO ELEMENTO ($pop: 1)
db.products.updateOne({ sku: "CAMERA-CANON-EOS-R5" }, { $pop: { tags: 1 } })

4.4 RIMUOVI PRIMO ELEMENTO ($pop: -1)
db.products.updateOne({ sku: "CAMERA-CANON-EOS-R5" }, { $pop: { tags: -1 } })

5.1 INSERISCI PRODOTTO CON ARRAY DI RECENSIONI
db.products.insertOne({ sku: "BOOK-MONGODB-GUIDE", name: "MongoDB: The Definitive Guide", category: "Books", price: 49.99, reviews: [ { author: "Alice", rating: 5, comment: "Excellent book!", date: new Date("2024-01-15") }, { author: "Bob", rating: 4, comment: "Very informative", date: new Date("2024-01-18") } ], status: "active" })

5.2 AGGIUNGI RECENSIONE A PRODOTTO
db.products.updateOne({ sku: "BOOK-MONGODB-GUIDE" }, { $push: { reviews: { author: "Charlie", rating: 5, comment: "Best MongoDB resource!", date: new Date() } } })

5.3 TROVA PRODOTTI CON ALMENO UNA RECENSIONE A 5 STELLE
db.products.find({ "reviews.rating": 5 })

5.4 TROVA RECENSIONI CON $elemMatch (rating 5 E author Alice)
db.products.find({ reviews: { $elemMatch: { rating: 5, author: "Alice" } } })

6.1 AGGIORNA PRIMO ELEMENTO CORRISPONDENTE ($)
db.products.updateOne({ sku: "BOOK-MONGODB-GUIDE", "reviews.author": "Alice" }, { $set: { "reviews.$.rating": 5 } })

6.2 AGGIORNA ELEMENTO PER INDICE
db.products.updateOne({ sku: "BOOK-MONGODB-GUIDE" }, { $set: { "reviews.1.comment": "Updated comment" } })

6.3 RIMUOVI OGGETTO SPECIFICO DALL'ARRAY
db.products.updateOne({ sku: "BOOK-MONGODB-GUIDE" }, { $pull: { reviews: { author: "Alice" } } })

7.1 AGGIUNGI TAG IN POSIZIONE (BEGINNING)
db.products.updateOne({ sku: "CAMERA-CANON-EOS-R5" }, { $push: { tags: { $each: ["editor-choice"], $position: 0 } } })

7.2 AGGIUNGI E ORDINA
db.products.updateOne({ sku: "CAMERA-CANON-EOS-R5" }, { $push: { tags: { $each: ["new-tag-1", "new-tag-2"], $sort: 1 } } })

7.3 AGGIUNGI RECENSIONI E LIMITA DIMENSIONE A 5
db.products.updateOne({ sku: "BOOK-MONGODB-GUIDE" }, { $push: { reviews: { $each: [ { author: "Dave", rating: 4, comment: "Good book", date: new Date() } ], $sort: { date: -1 }, $slice: 5 } } })

8.1 SHOPPING CART - AGGIUNGI PRODOTTO AL CARRELLO
db.users.updateOne({ email: "user@example.com" }, { $push: { cart: { productId: ObjectId("000000000000000000000000"), quantity: 1, addedAt: new Date() } } })

8.2 RIMUOVI DAL CARRELLO
db.users.updateOne({ email: "user@example.com" }, { $pull: { cart: { productId: ObjectId("000000000000000000000000") } } })

8.3 AGGIORNA QUANTITA' NEL CARRELLO
db.users.updateOne({ email: "user@example.com", "cart.productId": ObjectId("000000000000000000000000") }, { $set: { "cart.$.quantity": 3 } })

8.4 WISHLIST TOGGLE (ESEMPIO)
// Pseudocode: eseguire un check e poi $pull o $addToSet; qui un esempio pratico in due comandi
db.users.updateOne({ email: "user@example.com" }, { $addToSet: { wishlist: ObjectId("000000000000000000000000") } })
db.users.updateOne({ email: "user@example.com" }, { $pull: { wishlist: ObjectId("000000000000000000000000") } })

