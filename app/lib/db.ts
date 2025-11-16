import fs from 'fs';
import path from 'path';
import { Database } from './types'; // Import your shared type

// Cache the DB in memory so we don't read the file on every request
let cachedDb: Database | null = null;

/**
 * Loads the database from /public/db.json.
 * Uses a simple cache for performance.
 */
export function loadDb(): Database {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'db.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const db: Database = JSON.parse(fileContents);

    cachedDb = db; // Store in cache
    return db;
  } catch (error) {
    console.error("Failed to load or parse db.json:", error);
    // If it fails, return an empty structure to prevent crashes
    return { available_tags: [], products: [] };
  }
}
