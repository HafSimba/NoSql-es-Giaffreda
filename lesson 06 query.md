LEZIONE 06 

1.1 INSERISCI UTENTE CON INDIRIZZO COMPLETO
db.users.insertOne({ name: { first: "Jessica", last: "Taylor" }, email: "jessica.taylor@example.com", phone: "+1-555-0166", address: { street: "456 Oak Avenue", city: "San Francisco", state: "CA", zipCode: "94102", country: "USA", coordinates: { lat: 37.7749, lng: -122.4194 } }, role: "customer", status: "active" })

1.2 INSERISCI PRODOTTO CON SPECIFICHE ANNIDATE
db.products.insertOne({ sku: "SMARTPHONE-IPHONE-15-PRO", name: "iPhone 15 Pro", category: "Electronics", subcategory: "Smartphones", price: 999.00, specifications: { display: { size: "6.1 inches", type: "OLED", resolution: "2556 x 1179" }, processor: { model: "A17 Pro", cores: 6, gpu: "Apple GPU (6-core)" }, memory: { ram: "8GB", storage: "256GB" }, camera: { rear: { main: "48MP", ultrawide: "12MP", telephoto: "12MP" }, front: "12MP" } }, status: "active" })

2.1 QUERY PER CITTA' (SAN FRANCISCO)
db.users.find({ "address.city": "San Francisco" })

2.2 QUERY PER STATO (CA)
db.users.find({ "address.state": "CA" })

2.3 QUERY CAMPO PROFONDAMENTE ANNIDATO (DISPLAY 6.1)
db.products.find({ "specifications.display.size": "6.1 inches" })

2.4 QUERY PER RAM (8GB)
db.products.find({ "specifications.memory.ram": "8GB" })

2.5 PIU' CONDIZIONI ANNIDATE (DISPLAY OLED E STORAGE 256GB)
db.products.find({ "specifications.display.type": "OLED", "specifications.memory.storage": "256GB" })

3.1 AGGIORNA INDIRIZZO (Cambia street di Jessica)
db.users.updateOne({ email: "jessica.taylor@example.com" }, { $set: { "address.street": "789 Pine Street" } })

3.2 AGGIORNA PIU' CAMPI ANNIDATI (City, State, Zip)
db.users.updateOne({ email: "jessica.taylor@example.com" }, { $set: { "address.city": "Los Angeles", "address.state": "CA", "address.zipCode": "90001" } })

3.3 AGGIORNA CAMPO PROFONDAMENTE ANNIDATO (Front camera a 15MP)
db.products.updateOne({ sku: "SMARTPHONE-IPHONE-15-PRO" }, { $set: { "specifications.camera.front": "15MP" } })

3.4 AGGIORNA COORDINATE DI JESSICA
db.users.updateOne({ email: "jessica.taylor@example.com" }, { $set: { "address.coordinates.lat": 34.0522, "address.coordinates.lng": -118.2437 } })

4.1 SOSTITUISCI L'INTERO OGGETTO INDIRIZZO DI JESSICA
db.users.updateOne({ email: "jessica.taylor@example.com" }, { $set: { address: { street: "321 Maple Drive", city: "Seattle", state: "WA", zipCode: "98101", country: "USA" } } })

4.2 DIFFERENZA TRA AGGIORNAMENTO PARZIALE E COMPLETO
db.users.updateOne({ email: "user@example.com" }, { $set: { "address.city": "Boston" } })
db.users.updateOne({ email: "user@example.com" }, { $set: { address: { city: "Boston" } } })

5.1 AGGIUNGI NUOVA SPECIFICA (BATTERY)
db.products.updateOne({ sku: "SMARTPHONE-IPHONE-15-PRO" }, { $set: { "specifications.battery": "3200mAh" } })

5.2 AGGIUNGI OGGETTO ANNIDATO (SHIPPING) ALL'INDIRIZZO DI JESSICA
db.users.updateOne({ email: "jessica.taylor@example.com" }, { $set: { "address.shipping": { allowPOBox: false, requireSignature: true } } })

6.1 INSERISCI UTENTE CON METODI DI PAGAMENTO
db.users.insertOne({ name: { first: "Robert", last: "Anderson" }, email: "robert.anderson@example.com", paymentMethods: { creditCard: { last4: "1234", brand: "Visa", expiryMonth: 12, expiryYear: 2025 }, paypal: { email: "robert.paypal@example.com", verified: true } }, role: "customer", status: "active" })

6.2 QUERY PER METODI DI PAGAMENTO (PAYPAL VERIFICATO)
db.users.find({ "paymentMethods.paypal.verified": true })

6.3 AGGIORNA METODO DI PAGAMENTO (CREDIT CARD LAST4)
db.users.updateOne({ email: "robert.anderson@example.com" }, { $set: { "paymentMethods.creditCard.last4": "5678" } })

7.1 RIFERIMENTO: EMBEDDED VS REFERENCED
Risposta: Scegliere Referenced (Opzione B) gli ordini crescono senza limiti, sono spesso grandi, vengono interrogati separatamente, c'è il limite di dimensione del documento (16MB) e i pattern di aggiornamento differiscono.

8.1 AGGIUNGI REVIEWS SUMMARY A UN PRODOTTO
db.products.updateOne({ sku: "LAPTOP-DELL-XPS13" }, { $set: { reviewsSummary: { average: 4.5, count: 127, distribution: { "5star": 78, "4star": 32, "3star": 12, "2star": 3, "1star": 2 }, featured: [ { author: "Jane D.", rating: 5, comment: "Best laptop ever!", helpful: 45 } ] } } })

8.2 AGGIUNGI PREFERENZE UTENTE
db.users.updateOne({ email: "user@example.com" }, { $set: { preferences: { theme: "dark", language: "en", notifications: { email: true, sms: false, push: true, frequency: "daily" }, privacy: { showEmail: false, showPhone: false, allowMarketingEmails: true } } } })

