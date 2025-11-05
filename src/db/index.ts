import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '@/db/schema';

const pool = mysql.createPool(process.env.MYSQL_URL!);

export const db = drizzle(pool, { schema, mode: 'default' });

export type Database = typeof db;