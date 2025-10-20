QUERY LESSON 01
1.1 INSERISCI L'UTENTE

db.users.insertOne({
  name: { first: "Emma", last: "Wilson" },
  email: "emma.wilson@example.com",
  phone: "+1-555-0199",
  roll: "customer",
  status: "active",
  created_at: new Date()
})

  1.2 INSERISCI IL PRODOTTO

  db.products.insertOne({
  SKU: "HDPHN-SONY-WH1000XM5",
  name: "Sony WH-1000XM5 Wireless",
  description: "Industry-leading noise cancellation...",
  category: "Electronics",
  subcategory: "Headphones",
  Brand: "Sony",
  Price: 399.99,
  Currency: "USD",
  Tags: ["wireless", "noise-cancelling", "premium", "bluetooth"],
  Status: "active",
  featured: true,
  specification: {
    type: "over-ear",
    connectivity: "bluetooth 5.2",
    batterylife: "30 hours",
    noisecancellation: true
  }
})

acknowledged: true,
  insertedId: ObjectId('68f1461d8b9a5dfc5334d9c9')

2.1  INSERISCI PIU' UTENTI

db.users.insertMany([
  {
    name: { first: "Michael", last: "Chen" },
    email: "michael.chen@example.com",
    roll: "customer",
    status: "active"
  },
  {
    name: { first: "Sarah", last: "Johnson" },
    email: "sarah.johnson@example.com",
    roll: "customer",
    status: "active"
  },
  {
    name: { first: "David", last: "Martinez" },
    email: "david.martinez@example.com",
    roll: "admin",
    status: "active"
  }
])

 2.2 INSERISCI PIU PRODOTTI

db.products.insertMany([
  {
    SKU: "LAPTOP-DELL-XPS13",
    name: "Dell XPS 13",
    category: "Electronics",
    subcategory: "Laptops",
    Price: 1299.99,
    Status: "active",
    Tags: ["laptop", "ultrabook", "dell"]
  },
  {
    SKU: "MOUSE-LOGITECH-MX3",
    name: "Logitech MX Master 3",
    category: "Electronics",
    subcategory: "Accessories",
    Price: 99.99,
    Status: "active",
    Tags: ["mouse", "wireless", "ergonomic"]
  }
])
  
3.1 inserimento utente con _id personalizzato
db.users.insertOne({
  _id: "user_custom_001",
  name: "Test User",
  email: "test.user@example.com",
  roll: "customer"
})
SE INSERISCO UN UTENTE DIVERSO CON STESSO CODICE ID UNIVOCO SUCCEDE:
db.users.insertOne({
  _id: "user_custom_001",
  name: "Second Test User",
  email: "second.user@example.com",
  roll: "customer"
})
MongoServerError: E11000 duplicate key error collection: test.users index: _id_ dup key: { _id: "user_custom_001" }

3.2

