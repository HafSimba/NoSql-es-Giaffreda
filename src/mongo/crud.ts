import { connectMongo } from "./connection.js";

export const createOne = async (collectionName: string, document: any) => {
  try {
    const db = await connectMongo();
    const collection = db.collection(collectionName);
    const result = await collection.insertOne(document);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create document");
  }
};

export const findOne = async (collectionName: string, filter: any) => {
  try {
    const db = await connectMongo();
    const collection = db.collection(collectionName);
    const result = await collection.findOne(filter);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to find document");
  }
};

export const updateOne = async (collectionName: string, filter: any, update: any) => {
  try {
    const db = await connectMongo();
    const collection = db.collection(collectionName);
    const result = await collection.updateOne(filter, update);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update document");
  }
};

export const createMany = async (collectionName: string, documents: any[]) => {
  try {
    const db = await connectMongo();
    const collection = db.collection(collectionName);
    const result = await collection.insertMany(documents);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create documents");
  }
};

export const findMany = async (collectionName: string, filter: any = {}, projection: any = {}) => {
  try {
    const db = await connectMongo();
    const collection = db.collection(collectionName);
    const result = await collection.find(filter, { projection }).toArray();
    return result;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to find documents");
  }
};

export const updateMany = async (collectionName: string, filter: any, update: any) => {
  try {
    const db = await connectMongo();
    const collection = db.collection(collectionName);
    const result = await collection.updateMany(filter, update);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update documents");
  }
};

export const deleteOne = async (collectionName: string, filter: any) => {
  try {
    const db = await connectMongo();
    const collection = db.collection(collectionName);
    const result = await collection.deleteOne(filter);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete document");
  }
};

export const deleteMany = async (collectionName: string, filter: any) => {
  try {
    const db = await connectMongo();
    const collection = db.collection(collectionName);
    const result = await collection.deleteMany(filter);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete documents");
  }
};