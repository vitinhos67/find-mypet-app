import { CollarDevice } from '../../src/models/device.model';
import { initializeDatabase } from '../migrations';
import { getDatabase } from '../sqlite';

type DeviceCacheRow = {
    payload_json: string;
};

export class DeviceLocalRepository {
    static async replaceAll(userId: string, devices: CollarDevice[]) {
        await initializeDatabase();
        const db = await getDatabase();
        const now = new Date().toISOString();

        await db.withTransactionAsync(async () => {
            await db.runAsync(
                'DELETE FROM devices_cache WHERE user_id = ?;',
                userId
            );

            for (const device of devices) {
                await this.upsertInTransaction(userId, device, now);
            }
        });
    }

    static async upsert(userId: string, device: CollarDevice) {
        await initializeDatabase();
        await this.upsertInTransaction(
            userId,
            device,
            new Date().toISOString()
        );
    }

    static async findAll(userId: string): Promise<CollarDevice[]> {
        await initializeDatabase();
        const db = await getDatabase();
        const rows = await db.getAllAsync<DeviceCacheRow>(
            `
            SELECT payload_json
            FROM devices_cache
            WHERE user_id = ?
            ORDER BY updated_at DESC;
            `,
            userId
        );

        return rows.map((row) => JSON.parse(row.payload_json) as CollarDevice);
    }

    static async findById(
        userId: string,
        deviceId: string
    ): Promise<CollarDevice | null> {
        await initializeDatabase();
        const db = await getDatabase();
        const row = await db.getFirstAsync<DeviceCacheRow>(
            `
            SELECT payload_json
            FROM devices_cache
            WHERE user_id = ? AND id = ?;
            `,
            userId,
            deviceId
        );

        return row ? JSON.parse(row.payload_json) as CollarDevice : null;
    }

    static async deleteById(userId: string, deviceId: string) {
        await initializeDatabase();
        const db = await getDatabase();

        await db.runAsync(
            'DELETE FROM devices_cache WHERE user_id = ? AND id = ?;',
            userId,
            deviceId
        );
    }

    private static async upsertInTransaction(
        userId: string,
        device: CollarDevice,
        now: string
    ) {
        const db = await getDatabase();

        await db.runAsync(
            `
            INSERT INTO devices_cache (
                user_id,
                id,
                payload_json,
                updated_at,
                synced_at
            )
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(user_id, id) DO UPDATE SET
                payload_json = excluded.payload_json,
                updated_at = excluded.updated_at,
                synced_at = excluded.synced_at;
            `,
            userId,
            device.id,
            JSON.stringify(device),
            now,
            now
        );
    }
}
