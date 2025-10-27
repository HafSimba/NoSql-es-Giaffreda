import {MongoClient } from "mongodb";


export const connectMongo = async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error("MONGO_URI is not set");
    }

    const dName = process.env.MONGO_DB_NAME;
    if (!dName) {
        throw new Error("MONGO_DB_NAME is not set");
    }

    try{
        const client = new MongoClient(mongoUri, {
            maxPoolSize: 10,
        });
        const connection = await client.connect();
        const db = connection.db(dName);
        return db;
    } catch (error) {
        console.error(error);
        throw error;
    }
}