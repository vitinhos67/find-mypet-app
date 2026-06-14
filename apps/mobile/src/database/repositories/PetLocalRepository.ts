import { Pet } from '../../models/pet.model';
import { initializeDatabase } from '../migrations';
import { getDatabase } from '../sqlite';

type PetCacheRow = {
    payload_json: string;
};

export class PetLocalRepository {
    static async replaceAll(userId: string, pets: Pet[]) {
        await initializeDatabase();
        const db = await getDatabase();
        const now = new Date().toISOString();

        await db.withTransactionAsync(async () => {
            await db.runAsync(
                'DELETE FROM pets_cache WHERE user_id = ?;',
                userId
            );

            for (const pet of pets) {
                await this.upsertInTransaction(userId, pet, now);
            }
        });
    }

    static async upsert(userId: string, pet: Pet) {
        await initializeDatabase();
        await this.upsertInTransaction(
            userId,
            pet,
            new Date().toISOString()
        );
    }

    static async findAll(userId: string): Promise<Pet[]> {
        await initializeDatabase();
        const db = await getDatabase();
        const rows = await db.getAllAsync<PetCacheRow>(
            `
            SELECT payload_json
            FROM pets_cache
            WHERE user_id = ?
            ORDER BY updated_at DESC;
            `,
            userId
        );

        return rows.map((row) => JSON.parse(row.payload_json) as Pet);
    }

    static async findById(
        userId: string,
        petId: string
    ): Promise<Pet | null> {
        await initializeDatabase();
        const db = await getDatabase();
        const row = await db.getFirstAsync<PetCacheRow>(
            `
            SELECT payload_json
            FROM pets_cache
            WHERE user_id = ? AND id = ?;
            `,
            userId,
            petId
        );

        return row ? JSON.parse(row.payload_json) as Pet : null;
    }

    static async deleteById(userId: string, petId: string) {
        await initializeDatabase();
        const db = await getDatabase();

        await db.runAsync(
            'DELETE FROM pets_cache WHERE user_id = ? AND id = ?;',
            userId,
            petId
        );
    }

    private static async upsertInTransaction(
        userId: string,
        pet: Pet,
        now: string
    ) {
        const db = await getDatabase();

        await db.runAsync(
            `
            INSERT INTO pets_cache (
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
            pet.id,
            JSON.stringify(pet),
            now,
            now
        );
    }
}
