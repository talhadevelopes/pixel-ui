// src/utils/drizzle.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../db/schema';
import dotenv from 'dotenv';
dotenv.config();

let db : any;

if (process.env.DATABASE_URL) {
    const sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql, { schema });
    console.log("Connected to Database via Drizzle")
} else {
    console.warn('DATABASE_URL not found, using mock database');
    // Create a mock db object or throw error when methods are called
    db = {
        insert: () => { throw new Error('Database not configured') },
        select: () => { throw new Error('Database not configured') },
        // Add other methods as needed
    };
}

export { db };