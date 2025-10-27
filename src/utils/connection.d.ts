import type { Db } from 'mongodb';
export function connectToDatabase(): Promise<Db>;
export function closeConnection(): Promise<void>;
