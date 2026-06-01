import { UserProfile } from '../../models/profile.model';
import { initializeDatabase } from '../migrations';
import { getDatabase } from '../sqlite';

type ProfileCacheRow = {
    user_id: string;
    nome: string;
    email: string;
    telefone: string | null;
    genero: string | null;
    avatar_path: string | null;
    updated_at: string;
    synced_at: string | null;
};

export class ProfileLocalRepository {
    static async upsert(
        userId: string,
        profile: UserProfile,
        syncedAt = new Date().toISOString()
    ) {
        await initializeDatabase();
        const db = await getDatabase();
        const updatedAt = new Date().toISOString();

        await db.runAsync(
            `
            INSERT INTO profiles_cache (
                user_id,
                nome,
                email,
                telefone,
                genero,
                avatar_path,
                updated_at,
                synced_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                nome = excluded.nome,
                email = excluded.email,
                telefone = excluded.telefone,
                genero = excluded.genero,
                avatar_path = excluded.avatar_path,
                updated_at = excluded.updated_at,
                synced_at = excluded.synced_at;
            `,
            userId,
            profile.nome,
            profile.email,
            profile.telefone ?? null,
            profile.genero ?? null,
            profile.avatarPath ?? null,
            updatedAt,
            syncedAt
        );
    }

    static async findByUserId(userId: string): Promise<UserProfile | null> {
        await initializeDatabase();
        const db = await getDatabase();
        const row = await db.getFirstAsync<ProfileCacheRow>(
            'SELECT * FROM profiles_cache WHERE user_id = ?;',
            userId
        );

        if (!row) {
            return null;
        }

        return {
            nome: row.nome,
            email: row.email,
            telefone: row.telefone,
            genero: row.genero,
            avatarPath: row.avatar_path,
        };
    }

    static async deleteByUserId(userId: string) {
        await initializeDatabase();
        const db = await getDatabase();

        await db.runAsync(
            'DELETE FROM profiles_cache WHERE user_id = ?;',
            userId
        );
    }
}
