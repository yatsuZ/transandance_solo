import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Logger } from '../utils/logger.js';

/**
 * Obtient le répertoire actuel de manière compatible CommonJS/ES modules
 * En mode test (Jest/CommonJS), utilise process.cwd() + chemin relatif
 * En production (ES modules), le chemin sera correct via les imports compilés
 */
const getDirname = (): string => {
  return path.join(process.cwd(), 'srcs', 'backend', 'core', 'db');
};

/**
 * Gère la connexion à la base de données SQLite
 * Initialise automatiquement le schéma au premier démarrage
 */
export class DatabaseManager {
  private db: Database.Database;
  private dbPath: string;

  constructor(dbPath?: string) {
    const baseDir = getDirname();
    this.dbPath = dbPath || path.join(baseDir, '../../data/pong.db');

    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      Logger.info('Created data directory:', dataDir);
    }

    this.db = new Database(this.dbPath);
    Logger.info('Connected to database:', this.dbPath);

    this.initSchema();
    this.runMigrations();
  }

  /**
   * Exécute le fichier schema.sql pour créer les tables
   */
  private initSchema(): void {
    try {
      const baseDir = getDirname();
      const schemaPath = path.join(baseDir, 'script/schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      this.db.exec(schema);
      Logger.success('Schema initialized successfully');
    } catch (error) {
      Logger.error('Failed to initialize schema:', error);
      throw error;
    }
  }

  /**
   * Exécute les migrations SQL dans l'ordre
   */
  private runMigrations(): void {
    try {
      const baseDir = getDirname();
      const migrationsDir = path.join(baseDir, 'script/migrations');

      if (!fs.existsSync(migrationsDir)) {
        return;
      }

      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      migrationFiles.forEach(file => {
        const migrationPath = path.join(migrationsDir, file);
        const migration = fs.readFileSync(migrationPath, 'utf-8');

        try {
          this.db.exec(migration);
          Logger.info(`Migration applied: ${file}`);
        } catch (error: any) {
          if (error.message && error.message.includes('duplicate column')) {
            Logger.info(`Migration already applied: ${file}`);
          } else {
            throw error;
          }
        }
      });
    } catch (error) {
      Logger.error('Failed to run migrations:', error);
      throw error;
    }
  }

  /**
   * Retourne la connexion à la base de données
   */
  getConnection(): Database.Database {
    return this.db;
  }

  /**
   * Ferme la connexion à la base de données
   */
  close(): void {
    this.db.close();
    Logger.info('Database connection closed');
  }
}

// Export de l'instance unique (singleton)
export const db = new DatabaseManager();
