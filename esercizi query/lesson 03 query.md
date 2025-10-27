```markdown
QUERY LESSON 03

1.1 AGGIORNA EMAIL UTENTE
db.users.updateOne({ email: "emma.wilson@example.com" }, { $set: { email: "emma.w@example.com" } })

1.2 AGGIORNA PREZZO PRODOTTO (Sony headphones)
db.products.updateOne({ SKU: "HDPHN-SONY-WH1000XM5" }, { $set: { price: 379.99 } })

1.3 AGGIORNA PIU' CAMPI PER UTENTE
db.users.updateOne({ email: "michael.chen@example.com" }, { $set: { phone: "+1-555-0150", status: "inactive" } })

2.1 IMPOSTA PREFERENZA NEWSLETTER PER TUTTI I CUSTOMER
db.users.updateMany({ role: "customer" }, { $set: { "preferences.newsletter": true } })

2.2 AGGIUNGI lastUpdated AI PRODOTTI ATTIVI
db.products.updateMany({ status: "active" }, { $set: { lastUpdated: new Date() } })

2.3 BULK UPDATE - MARCA PRODOTTI ELECTRONICS
db.products.updateMany({ category: "Electronics" }, { $set: { updated: true } })

3.1 INCREMENTA QUANTITA' (Dell XPS 13)
db.products.updateOne({ SKU: "LAPTOP-DELL-XPS13" }, { $inc: { quantity: 10 } })

3.2 DECREMENTA PREZZO (Sony headphones)
db.products.updateOne({ SKU: "HDPHN-SONY-WH1000XM5" }, { $inc: { price: -20 } })

3.3 TRACCIA LOGIN (Emma)
db.users.updateOne({ email: "emma.w@example.com" }, { $inc: { loginCount: 1 }, $setOnInsert: { created_at: new Date() } }, { upsert: false })

4.1 SCONTO 10% SU TUTTI I PRODOTTI
db.products.updateMany({}, { $mul: { price: 0.9 } })

5.1 RIMUOVI CAMPO updated DA TUTTI I PRODOTTI
db.products.updateMany({ updated: { $exists: true } }, { $unset: { updated: "" } })

5.2 RIMUOVI TELEFONO DA UN UTENTE
db.users.updateOne({ email: "michael.chen@example.com" }, { $unset: { phone: "" } })

6.1 RINOMINA loginCount IN totalLogins
db.users.updateMany({ loginCount: { $exists: true } }, { $rename: { "loginCount": "totalLogins" } })

7.1 AGGIORNA CITTA' NELL'INDIRIZZO DI EMMA
db.users.updateOne({ email: "emma.w@example.com" }, { $set: { "address.city": "Boston" } })

7.2 AGGIORNA SPECIFICHE PRODOTTO (Sony)
db.products.updateOne({ SKU: "HDPHN-SONY-WH1000XM5" }, { $set: { "specifications.weight": "250g" } })

8.1 IMPOSTA updatedAt PER UN PRODOTTO
db.products.updateOne({ SKU: "HDPHN-SONY-WH1000XM5" }, { $currentDate: { updatedAt: true } })

9.1 AGGIORNAMENTO COMPLESSO PER SONY
db.products.updateOne({ SKU: "HDPHN-SONY-WH1000XM5" }, { $inc: { price: 10 }, $set: { status: "active" }, $currentDate: { updatedAt: true } })
