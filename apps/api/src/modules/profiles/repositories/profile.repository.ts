import { AppException } from "../../../shared/exceptions/app.exception";
import { ErrorCodes } from "../../../shared/exceptions/error-codes";
import { supabaseAdmin } from "../../../shared/supabase/supabaseAdmin";

export type Profile = {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    gender: string | null;
    avatar_url: string | null;
    updated_at: string | null;
};

type CreateProfileInput = {
    id: string;
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    gender?: string | null;
    avatar_url?: string | null;
};

type UpdateProfileInput = {
    full_name?: string | null;
    phone?: string | null;
    gender?: string | null;
    avatar_url?: string | null;
};

const PROFILE_FIELDS =
    "id, full_name, email, phone, gender, avatar_url, updated_at";

export class ProfileRepository {
    async findById(id: string): Promise<Profile | null> {
        const { data, error } = await supabaseAdmin
            .from("profiles")
            .select(PROFILE_FIELDS)
            .eq("id", id)
            .maybeSingle();

        if (error) {
            throw new AppException(
                "Não foi possível buscar o perfil do usuário.",
                500,
                ErrorCodes.INTERNAL_ERROR,
                error.message,
            );
        }

        return data ?? null;
    }

    async create(input: CreateProfileInput): Promise<Profile> {
        const { data, error } = await supabaseAdmin
            .from("profiles")
            .insert({
                id: input.id,
                full_name: input.full_name ?? null,
                email: input.email ?? null,
                phone: input.phone ?? null,
                gender: input.gender ?? null,
                avatar_url: input.avatar_url ?? null,
                updated_at: new Date().toISOString(),
            })
            .select(PROFILE_FIELDS)
            .single();

        if (error) {
            throw new AppException(
                "Não foi possível criar o perfil do usuário.",
                500,
                ErrorCodes.INTERNAL_ERROR,
                error.message,
            );
        }

        return data;
    }

    async updateById(id: string, input: UpdateProfileInput): Promise<Profile> {
        const { data, error } = await supabaseAdmin
            .from("profiles")
            .update({
                ...input,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select(PROFILE_FIELDS)
            .single();

        if (error) {
            throw new AppException(
                "Não foi possível atualizar o perfil do usuário.",
                500,
                ErrorCodes.INTERNAL_ERROR,
                error.message,
            );
        }

        return data;
    }
}
