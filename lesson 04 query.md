QUERY LESSON 

1.1 CREA DOCUMENTI DI TEST
db.users.insertMany([{ name: { first: "Test", last: "User1" }, email: "test1@delete.com", role: "customer", status: "test" }, { name: { first: "Test", last: "User2" }, email: "test2@delete.com", role: "customer", status: "test" }, { name: { first: "Test", last: "User3" }, email: "test3@delete.com", role: "customer", status: "test" }])

1.2 PREVIEW PRIMA DI CANCELLARE
db.users.find({ status: "test" })
db.users.countDocuments({ status: "test" })

1.3 DELETE ONE (ELIMINA test1)
db.users.deleteOne({ email: "test1@delete.com" })

1.4 VERIFICA CANCELLAMENTO
db.users.findOne({ email: "test1@delete.com" })
db.users.countDocuments({ status: "test" })

2.1 DELETE REMAINING TEST USERS
db.users.find({ status: "test" })
db.users.deleteMany({ status: "test" })

2.2 DELETE BY MULTIPLE CRITERIA (PRODUCTS TEST)
db.products.insertMany([{ sku: "TEST-001", name: "Test Product 1", category: "Test", price: 5.99, status: "active" }, { sku: "TEST-002", name: "Test Product 2", category: "Test", price: 8.99, status: "active" }])
db.products.find({ category: "Test", price: { $lt: 10 } })
db.products.deleteMany({ category: "Test", price: { $lt: 10 } })

3.1 DELETE INACTIVE USERS
db.users.find({ status: "inactive" })

3.2 DELETE OLD DOCUMENTS
db.products.deleteMany({ createdAt: { $lt: ISODate("2024-01-01") } })

4.1 DELETE ALL TEST DATA (ESEMPIO)
db.testCollection.insertMany([{ name: "Item 1" }, { name: "Item 2" }, { name: "Item 3" }])
db.testCollection.find()
db.testCollection.deleteMany({})
db.testCollection.countDocuments()

5.1 SOFT DELETE (PATTERN CONSIGLIATO)
db.users.updateOne({ email: "user@example.com" }, { $set: { status: "deleted", deletedAt: new Date() } })
db.users.find({ status: { $ne: "deleted" } })

5.2 ARCHIVE BEFORE DELETE
const user = db.users.findOne({ email: "archive@example.com" })
db.users_archive.insertOne({ ...user, archivedAt: new Date() })
db.users.deleteOne({ _id: user._id })

6.1 DELETE MATCHING NESTED FIELD
db.users.find({ "address.city": "TestCity" })
db.users.deleteMany({ "address.city": "TestCity" })

6.2 DELETE BY ARRAY ELEMENT
db.products.find({ tags: "discontinued" })
db.products.deleteMany({ tags: "discontinued" })

7.1 CHECK DELETE RESULTS
const result = db.users.deleteMany({ status: "test" })

7.2 HANDLE NO MATCHES
db.users.deleteOne({ email: "doesnotexist@example.com" })

