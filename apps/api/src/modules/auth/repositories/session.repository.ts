import { AppException } from "../../../shared/exceptions/app.exception";
import { ErrorCodes } from "../../../shared/exceptions/error-codes";
import { supabaseAdmin } from "../../../shared/supabase/supabaseAdmin";

export type ValidSession = {
  id: string;
  userId: string;
};

export class SessionRepository {
  async create(userId: string, expiresAt: Date): Promise<string> {
    const { data, error } = await supabaseAdmin
      .from("sessions")
      .insert({
        user_id: userId,
        expires_at: expiresAt.toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      throw new AppException(
        "Não foi possível criar a sessão.",
        500,
        ErrorCodes.INTERNAL_ERROR,
        error.message
      );
    }

    return data.id;
  }

  async findValid(sessionId: string): Promise<ValidSession | null> {
    const { data, error } = await supabaseAdmin
      .from("sessions")
      .select("id, user_id, expires_at")
      .eq("id", sessionId)
      .maybeSingle();

    if (error) {
      throw new AppException(
        "Não foi possível validar a sessão.",
        500,
        ErrorCodes.INTERNAL_ERROR,
        error.message
      );
    }

    if (!data) {
      return null;
    }

    if (new Date(data.expires_at).getTime() <= Date.now()) {
      await this.delete(sessionId);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
    };
  }

  async delete(sessionId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("sessions")
      .delete()
      .eq("id", sessionId);

    if (error) {
      throw new AppException(
        "Não foi possível encerrar a sessão.",
        500,
        ErrorCodes.INTERNAL_ERROR,
        error.message
      );
    }
  }
}
