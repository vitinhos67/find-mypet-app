import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from './sqlite';

const CURRENT_SCHEMA_VERSION = 1;

let initializeDatabasePromise: Promise<void> | null = null;

async function getCurrentVersion(db: SQLiteDatabase) {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS schema_metadata (
            key TEXT PRIMARY KEY NOT NULL,
            value TEXT NOT NULL
        );
    `);

    const row = await db.getFirstAsync<{ value: string }>(
        "SELECT value FROM schema_metadata WHERE key = 'schema_version';"
    );

    return row ? Number(row.value) : 0;
}

async function setCurrentVersion(db: SQLiteDatabase, version: number) {
    await db.runAsync(
        `
        INSERT INTO schema_metadata (key, value)
        VALUES ('schema_version', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value;
        `,
        String(version)
    );
}

async function migrateToVersion1(db: SQLiteDatabase) {
    await db.execAsync(`
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS profiles_cache (
            user_id TEXT PRIMARY KEY NOT NULL,
            nome TEXT NOT NULL,
            email TEXT NOT NULL,
            telefone TEXT,
            genero TEXT,
            avatar_path TEXT,
            updated_at TEXT NOT NULL,
            synced_at TEXT
        );

        CREATE TABLE IF NOT EXISTS pets_cache (
            user_id TEXT NOT NULL,
            id TEXT NOT NULL,
            payload_json TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            synced_at TEXT,
            PRIMARY KEY (user_id, id)
        );

        CREATE INDEX IF NOT EXISTS idx_pets_cache_user_id
        ON pets_cache(user_id);

        CREATE TABLE IF NOT EXISTS devices_cache (
            user_id TEXT NOT NULL,
            id TEXT NOT NULL,
            payload_json TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            synced_at TEXT,
            PRIMARY KEY (user_id, id)
        );

        CREATE INDEX IF NOT EXISTS idx_devices_cache_user_id
        ON devices_cache(user_id);

        CREATE TABLE IF NOT EXISTS sync_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            operation TEXT NOT NULL,
            payload_json TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            last_error TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_sync_queue_user_status
        ON sync_queue(user_id, status);
    `);
}

async function runMigrations() {
    const db = await getDatabase();
    const currentVersion = await getCurrentVersion(db);

    if (currentVersion < 1) {
        await migrateToVersion1(db);
        await setCurrentVersion(db, 1);
    }

    if (CURRENT_SCHEMA_VERSION < currentVersion) {
        console.warn(
            'SQLite schema version is newer than the app supports.',
            { currentVersion, supportedVersion: CURRENT_SCHEMA_VERSION }
        );
    }
}

export function initializeDatabase() {
    if (!initializeDatabasePromise) {
        initializeDatabasePromise = runMigrations().catch((error) => {
            initializeDatabasePromise = null;
            throw error;
        });
    }

    return initializeDatabasePromise;
}
