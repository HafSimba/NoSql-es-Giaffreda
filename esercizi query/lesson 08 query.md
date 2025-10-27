
LEZIONE 08 

1.1 UPDATE MULTIPLO IN UNA SOLA CHIAMATA
db.products.updateOne({ sku: "CAMERA-CANON-EOS-R5" }, { $inc: { price: 50 }, $addToSet: { tags: "premium" }, $set: { status: "active" }, $currentDate: { lastUpdated: true } })

1.2 AGGIORNA NIDIFICATO E ARRAY INSIEME
db.users.updateOne({ email: "user@example.com" }, { $set: { "address.city": "Boston" }, $addToSet: { interests: "photography" }, $inc: { loginCount: 1 } })

2.1 USO DI $min (AGGIORNA SOLO SE IL NUOVO VALORE È PIÙ BASSO)
db.products.updateOne({ sku: "CAMERA-CANON-EOS-R5" }, { $min: { price: 899 } })

2.2 USO DI $max (AGGIORNA SOLO SE IL NUOVO VALORE È PIÙ ALTO)
db.products.updateOne({ sku: "CAMERA-CANON-EOS-R5" }, { $max: { quantity: 100 } })

2.3 VINCOLI SU PREZZO (MIN E MAX)
db.products.updateOne({ sku: "LAPTOP-DELL-XPS13" }, { $max: { price: 49.99 }, $min: { discountPercent: 90 } })

3.1 UPSERT CON $setOnInsert
db.users.updateOne({ email: "new.user@example.com" }, { $set: { name: { first: "New", last: "User" }, email: "new.user@example.com", status: "active" }, $setOnInsert: { createdAt: new Date(), role: "customer" } }, { upsert: true })

3.2 TRACCIAMENTO FIRST/LAST SEEN
db.users.updateOne({ email: "user@example.com" }, { $set: { lastSeen: new Date() }, $setOnInsert: { firstSeen: new Date() } }, { upsert: true })

4.1 BULK WRITE - PIÙ AGGIORNAMENTI IN UNA CHIAMATA
db.products.bulkWrite([ { updateOne: { filter: { sku: "PRODUCT-001" }, update: { $set: { status: "active" } } } }, { updateOne: { filter: { sku: "PRODUCT-002" }, update: { $inc: { quantity: 10 } } } }, { insertOne: { document: { sku: "PRODUCT-003", name: "New Product", price: 99.99 } } } ])

4.2 BULK UPSERT
db.products.bulkWrite([ { updateOne: { filter: { sku: "SKU-001" }, update: { $set: { name: "Product 1", price: 29.99 } }, upsert: true } }, { updateOne: { filter: { sku: "SKU-002" }, update: { $set: { name: "Product 2", price: 39.99 } }, upsert: true } } ])

5.1 CONTATORE ATOMICO (findAndModify / findOneAndUpdate)
const result = db.counters.findAndModify({ query: { _id: "orderNumber" }, update: { $inc: { sequence: 1 } }, new: true, upsert: true })
const nextOrderNumber = result.sequence

5.2 RISERVA INVENTARIO IN MODO ATOMICO
const reserve = db.products.updateOne({ sku: "LAPTOP-DELL-XPS13", quantity: { $gte: 5 } }, { $inc: { quantity: -5 } })
if (reserve.modifiedCount === 0) { throw new Error("Insufficient stock") }

6.1 USO DI $cond IN AGGREGATION-PIPELINE PER UPDATE
db.products.updateMany({}, [ { $set: { status: { $cond: { if: { $gt: ["$quantity", 0] }, then: "in-stock", else: "out-of-stock" } } } } ])

7.1 CARRELLO: AGGIUNGI O INCREMENTA QUANTITÀ
const userCart = db.users.findOne({ email: "user@example.com", "cart.productId": productId })
if (userCart) { db.users.updateOne({ email: "user@example.com", "cart.productId": productId }, { $inc: { "cart.$.quantity": 1 } }) } else { db.users.updateOne({ email: "user@example.com" }, { $push: { cart: { productId: productId, quantity: 1, addedAt: new Date() } } }) }

7.2 VIEW COUNTER E LAST VIEWED
db.products.updateOne({ sku: "CAMERA-CANON-EOS-R5" }, { $inc: { viewCount: 1 }, $set: { lastViewed: new Date() }, $setOnInsert: { firstViewed: new Date() } }, { upsert: true })

7.3 CALCOLO RATING MEDIO (semplice)
db.products.updateOne({ sku: "LAPTOP-DELL-XPS13" }, { $inc: { "rating.count": 1, "rating.total": 5 } })
const p = db.products.findOne({ sku: "LAPTOP-DELL-XPS13" })
const avg = p.rating.total / p.rating.count
db.products.updateOne({ sku: "LAPTOP-DELL-XPS13" }, { $set: { "rating.average": avg } })

8.1 CHECK DEI RISULTATI DI UPDATE
const r = db.products.updateOne({ sku: "NON-EXISTENT" }, { $set: { status: "active" } })
if (r.matchedCount === 0) { console.log("Product not found") } else if (r.modifiedCount === 0) { console.log("No changes made (already had those values)") } else { console.log("Updated successfully") }

8.2 VALIDAZIONE PRIMA DI AGGIORNARE (ESEMPIO PER PERMESSI)
const admin = db.users.findOne({ email: "user@example.com", role: "admin" })
if (!admin) { throw new Error("Unauthorized") }
db.products.updateOne({ sku: "LAPTOP-DELL-XPS13" }, { $set: { status: "active" } })

9.1 OTTIMIZZAZIONI: BATCH VS INDIVIDUALI (ESEMPIO MIGLIORE)
db.products.updateMany({ _id: { $in: productIds } }, { $set: { status: "active" } })

9.2 USARE INDICI PER FILTRI DI UPDATE
db.products.updateOne({ sku: "LAPTOP-DELL-XPS13" }, { $set: { status: "active" } })

