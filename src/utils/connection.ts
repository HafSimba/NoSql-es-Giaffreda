import { MongoClient, Db } from 'mongodb';

let _client: MongoClient | null = null;

export async function connectToDatabase(): Promise<Db> {
  const mongoUri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME;
  if (!mongoUri) throw new Error('MONGO_URI is not set');
  if (!dbName) throw new Error('MONGO_DB_NAME is not set');

  if (!_client) {
    _client = new MongoClient(mongoUri, { maxPoolSize: 10 });
    await _client.connect();
  }

  return _client.db(dbName);
}

export async function closeConnection(): Promise<void> {
  if (_client) {
    try {
      await _client.close();
    } finally {
      _client = null;
    }
  }
}
