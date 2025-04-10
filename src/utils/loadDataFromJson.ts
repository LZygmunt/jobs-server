import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Database } from '../types.js';
import logger from './logger.js';

const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );

const JSON_FILE_PATH: string = '../data/db.json';

export const loadDataFromJson = (): Database | null => {
  try {
    const jsonData: Database = JSON.parse(
      fs.readFileSync( resolve( __dirname, JSON_FILE_PATH ), 'utf8' ),
    );
    logger( 'green', 'Data successfully loaded from JSON file' );
    return { ...jsonData }
  } catch ( error ) {
    logger( 'red', 'Error loading data from JSON file:', error );
    return null;
  }
};

export default loadDataFromJson