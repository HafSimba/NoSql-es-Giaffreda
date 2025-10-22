QUERY LESSON 02

1.1 TROVA TUTTI I DOCUMENTI

db.users.find()

utenti trovati: 4
campi per ogni utente: {
  _id: ObjectId(),
  name: {
    first:
    last: 
  },
  email:
  phone:
  roll:
  status:
  created_at:
}

1.2 TROVA TUTTI I PRETTY PRINT

db.users.find().pretty()

ESEMPIO DI COSA ESCE:
{
  _id: ObjectId('68f88496b899716db15d9772'),
  name: 'Auto ID User',
  email: 'auto.id@example.com'
}
E ALTRI

1.3 TROVA UN UTENTE QUALSIASI

db.users.findOne()

E' DIVERSO DA FIND PERCHE' FINDONE TROVA UN UTENTE MENTRE FIND LI TROVA TUTTI

2.1  TROVA UTENTE TRAMITE EMAIL

db.users.findOne({ email: "emma.wilson@example.com" })

2.2 TROVA UTENTE TRAMITE RUOLO

db.users.find({ role: "customer" })

2.3 TROVA UTENTI CON STATO ATTIVO E CONTALI

db.users.find({ status: "active" })

db.users.countDocuments({ status: "active" })

2.4 TROVA UTENTI CON PIU CRITERI

db.users.find({ role: "customer", status: "active"})

3.1 TROVA I PRODOTTI CHE COSTANO PIU DI 100 

db.products.find:({ price: { $gt: 100 }})

3.2 TROVA I PRODOTTI CHE COSTANO TRA 50 E 150 

db.products.find ({ price: { $gte: 50, $lte: 150 }})

3.3 TROVA I PRODOTTI CHE COSTANO MENO O UGUALE A 50

db.products.find({price: { $lte: 50 }})

3.4 TROVA I PRODOTTI  NON FEATURED

db.products.find({featured: { $ne: true }})

4.1 QUERY ANNIDATE 

db.users.findOne({"name.first": "Emma"})

4.2 TROVA UTENTI CHE VIVONO A NY

db.users.find({"address.city": "New York"})

4.3 TROVA SECONDO LE SPECIFICHE

db.products.find({"specifications.connectivity": /Bluetooth/i})

5.1 TROVA PRODOTTI CON UN TAG

db.products.find({tags: "wireless"})

5.2 TROVA PRODOTTI CON PIU TAG

db.products.find({tags: { $all: ["wireless", "premium"] }})

5.3 TROVA PRODOTTI CON QUALSIASI TAG

db.products.find({
  tags: { $in: ["wireless", "laptop"] }})

6.1 CONTA TUTTI GLI UTENTI 

db.users.countDocuments()

6.2 CONTA GLI UTENTI ATTIVI E CUSTOMER

db.users.countDocuments({role: "customer",status: "active"})

6.3 CONTA I PRODOTTI PIU COSTOSI DI 500 

db.products.countDocuments({price: { $gt: 500 }})

7.1 TROVA I PRIMI 3 UTENTI

db.users.find().limit(3)

7.2 ORDINA I PRODOTTI IN ORDINE ASCENDENTE PER PREZZO

db.products.find().sort({ price: 1 })

7.3 TROVA I 5 PRODOTTI PIU COSTOSI

db.products.find().sort({ price: -1 }).limit(5)
