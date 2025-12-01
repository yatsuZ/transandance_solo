import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Obtenir le répertoire actuel de manière compatible CommonJS/ES modules
// En mode test (Jest/CommonJS), on utilise process.cwd() + chemin relatif
// En production (ES modules), le chemin sera correct via les imports compilés
const getDirname = (): string => {
  // Pour les tests Jest et l'exécution normale
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
    // Par défaut : backend/data/pong.db
    const baseDir = getDirname();
    this.dbPath = dbPath || path.join(baseDir, '../../data/pong.db');

    // Créer le dossier data/ si nécessaire
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      if (process.env.NODE_ENV !== 'test') {
        console.log('[Database] Created data directory:', dataDir);
      }
    }

    // Connexion à la BDD
    this.db = new Database(this.dbPath);
    if (process.env.NODE_ENV !== 'test') {
      console.log('[Database] Connected to:', this.dbPath);
    }

    // Initialiser le schéma
    this.initSchema();

    // Exécuter les migrations
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
      if (process.env.NODE_ENV !== 'test') {
        console.log('[Database] Schema initialized successfully');
      }
    } catch (error) {
      console.error('[Database] Failed to initialize schema:', error);
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

      // Vérifier si le dossier migrations existe
      if (!fs.existsSync(migrationsDir)) {
        return; // Pas de migrations à exécuter
      }

      // Lire tous les fichiers .sql dans migrations/
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort(); // Tri alphabétique (001_xxx.sql, 002_xxx.sql, etc.)

      migrationFiles.forEach(file => {
        const migrationPath = path.join(migrationsDir, file);
        const migration = fs.readFileSync(migrationPath, 'utf-8');

        try {
          this.db.exec(migration);
          if (process.env.NODE_ENV !== 'test') {
            console.log(`[Database] Migration applied: ${file}`);
          }
        } catch (error: any) {
          // Ignorer l'erreur "duplicate column" (migration déjà appliquée)
          if (error.message && error.message.includes('duplicate column')) {
            if (process.env.NODE_ENV !== 'test') {
              console.log(`[Database] Migration already applied: ${file}`);
            }
          } else {
            throw error;
          }
        }
      });
    } catch (error) {
      console.error('[Database] Failed to run migrations:', error);
      throw error;
    }
  }

  /**
   * Retourne la connexion à la BDD
   */
  getConnection(): Database.Database {
    return this.db;
  }

  /**
   * Ferme la connexion à la BDD
   */
  close(): void {
    this.db.close();
    if (process.env.NODE_ENV !== 'test') {
      console.log('[Database] Connection closed');
    }
  }
}

// Export de l'instance unique (singleton)
export const db = new DatabaseManager();
