import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Missing MONGODB_URI');
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | null;
}

const globalForMongo = global as unknown as { _mongoClientPromise: Promise<MongoClient> | null };

if (!globalForMongo._mongoClientPromise) {
  const client = new MongoClient(uri, { maxPoolSize: 10 });
  globalForMongo._mongoClientPromise = client.connect();
}

export function getMongoClient(): Promise<MongoClient> {
  return globalForMongo._mongoClientPromise!;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB;
  return dbName ? client.db(dbName) : client.db();
}
