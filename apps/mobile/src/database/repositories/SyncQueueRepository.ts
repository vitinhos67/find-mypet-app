import { initializeDatabase } from '../migrations';
import { getDatabase } from '../sqlite';

export type SyncQueueStatus = 'pending' | 'synced' | 'failed';
export type SyncQueueOperation = 'create' | 'update' | 'delete';
export type SyncQueueEntity = 'profile' | 'pet' | 'device' | 'location';

export type SyncQueueItem = {
    id: number;
    userId: string;
    entityType: SyncQueueEntity;
    operation: SyncQueueOperation;
    payload: unknown;
    status: SyncQueueStatus;
    createdAt: string;
    updatedAt: string;
    lastError: string | null;
};

type SyncQueueRow = {
    id: number;
    user_id: string;
    entity_type: SyncQueueEntity;
    operation: SyncQueueOperation;
    payload_json: string;
    status: SyncQueueStatus;
    created_at: string;
    updated_at: string;
    last_error: string | null;
};

export class SyncQueueRepository {
    static async enqueue(input: {
        userId: string;
        entityType: SyncQueueEntity;
        operation: SyncQueueOperation;
        payload: unknown;
    }) {
        await initializeDatabase();
        const db = await getDatabase();
        const now = new Date().toISOString();

        const result = await db.runAsync(
            `
            INSERT INTO sync_queue (
                user_id,
                entity_type,
                operation,
                payload_json,
                status,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, 'pending', ?, ?);
            `,
            input.userId,
            input.entityType,
            input.operation,
            JSON.stringify(input.payload),
            now,
            now
        );

        return result.lastInsertRowId;
    }

    static async listPending(userId: string): Promise<SyncQueueItem[]> {
        await initializeDatabase();
        const db = await getDatabase();
        const rows = await db.getAllAsync<SyncQueueRow>(
            `
            SELECT *
            FROM sync_queue
            WHERE user_id = ? AND status = 'pending'
            ORDER BY created_at ASC;
            `,
            userId
        );

        return rows.map(this.mapRow);
    }

    static async markSynced(id: number) {
        await this.updateStatus(id, 'synced', null);
    }

    static async markFailed(id: number, error: string) {
        await this.updateStatus(id, 'failed', error);
    }

    private static async updateStatus(
        id: number,
        status: SyncQueueStatus,
        lastError: string | null
    ) {
        await initializeDatabase();
        const db = await getDatabase();

        await db.runAsync(
            `
            UPDATE sync_queue
            SET status = ?,
                last_error = ?,
                updated_at = ?
            WHERE id = ?;
            `,
            status,
            lastError,
            new Date().toISOString(),
            id
        );
    }

    private static mapRow(row: SyncQueueRow): SyncQueueItem {
        return {
            id: row.id,
            userId: row.user_id,
            entityType: row.entity_type,
            operation: row.operation,
            payload: JSON.parse(row.payload_json),
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            lastError: row.last_error,
        };
    }
}
