
LEZIONE 05 

1.1 TROVA I CLIENTI PREMIUM
db.users.find({ role: "customer", status: "active", "preferences.newsletter": true })

1.2 TROVA PRODOTTI NEL RANGE DI PREZZO PER CATEGORIA
db.products.find({ category: "Electronics", price: { $gte: 100, $lte: 500 } })

1.3 ESCLUDI PRODOTTI CON STATO SPECIFICO
db.products.find({ status: { $ne: "archived" } })

2.1 CONDIZIONE OR (ADMIN O INATTIVI)
db.users.find({ $or: [ { role: "admin" }, { status: "inactive" } ] })

2.2 CONDIZIONE AND/OR COMPLESSA
db.products.find({ $or: [ { category: "Electronics" }, { category: "Accessories" } ], price: { $lt: 200 }, status: "active" })

2.3 OPERATORE NOT (ESCLUDI TAG 'discontinued')
db.products.find({ tags: { $ne: "discontinued" } })

3.1 TAG MULTIPLI (TUTTI)
db.products.find({ tags: { $all: ["wireless", "premium", "bluetooth"] } })

3.2 QUALSIASI DI PIU' TAG (IN)
db.products.find({ tags: { $in: ["sale", "clearance", "discount"] } })

3.3 DIMENSIONE DELL'ARRAY
db.products.find({ tags: { $size: 3 } })

4.1 CAMPO ESISTENTE (compareAtPrice)
db.products.find({ compareAtPrice: { $exists: true } })

4.2 CAMPO ASSENTE (SENZA TELEFONO)
db.users.find({ phone: { $exists: false } })

4.3 CONTROLLO TIPO (price È STRINGA)
db.products.find({ price: { $type: "string" } })

5.1 RICERCA CATALOGO PRODOTTI
db.products.find({ name: { $regex: /laptop/i }, price: { $gte: 800, $lte: 2000 }, status: "active", tags: { $exists: true, $ne: [] } })

5.2 SEGMENTAZIONE CLIENTI (VIP)
db.users.find({ role: "customer", status: "active", "preferences.newsletter": true, email: { $not: { $regex: /(test|delete)/i } } })

5.3 CONTROLLO INVENTARIO (RIFORNIMENTO)
db.products.find({ status: "active", $or: [ { quantity: { $lt: 10 } }, { quantity: { $exists: false } } ] })

6.1 AGGIORNA IN BLOCCO (ARCHIVIA VECCHI)
const oneYearAgo = new Date(); oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1); db.products.updateMany({ status: "active", createdAt: { $lt: oneYearAgo } }, { $set: { status: "archived", archivedAt: new Date() } })

6.2 AGGIUSTAMENTO PREZZO (SCONTO 15%)
db.products.updateMany({ category: "Electronics", price: { $gt: 200 }, tags: "sale" }, { $mul: { price: 0.85 }, $addToSet: { tags: "discounted" }, $set: { saleEnds: ISODate("2024-02-01T00:00:00Z") } })

7.1 RIMUOVI DATI DI TEST (PREVIEW & DELETE)
db.users.find({ $or: [ { email: { $regex: /(test|delete)/i } }, { status: "test" } ] })
db.users.countDocuments({ $or: [ { email: { $regex: /(test|delete)/i } }, { status: "test" } ] })
db.users.deleteMany({ $or: [ { email: { $regex: /(test|delete)/i } }, { status: "test" } ] })

8.1 CONTA PER STATO (AGGREGAZIONE)
db.products.aggregate([ { $group: { _id: "$status", count: { $sum: 1 } } } ])

8.2 TROVA PRODOTTO PIU' COSTOSO
db.products.find().sort({ price: -1 }).limit(1)

8.3 UTENTI RECENTI
db.users.find().sort({ createdAt: -1 }).limit(10)

9.1 QUERY DASHBOARD (CONTI E LISTE)
const activeProducts = db.products.countDocuments({ status: "active" }); const activeCustomers = db.users.countDocuments({ role: "customer", status: "active" }); const electronics = db.products.find({ category: "Electronics" }).toArray(); const expensive = db.products.find({ price: { $gt: 1000 } }).toArray(); print(`Active Products: ${activeProducts}`); print(`Active Customers: ${activeCustomers}`); print(`Electronics: ${electronics.length}`); print(`Expensive Products: ${expensive.length}`)

10.1 SCRITTURA QUERY EFFICIENTE (RISPOSTA)
db.users.find({ role: "customer", status: "active" })

10.2 INDICI (CREA INDEX SU EMAIL)
db.users.createIndex({ email: 1 })


