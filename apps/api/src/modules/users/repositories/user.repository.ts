import { AppException } from "../../../shared/exceptions/app.exception";
import { ErrorCodes } from "../../../shared/exceptions/error-codes";
import { supabaseAdmin } from "../../../shared/supabase/supabaseAdmin";
import type { CreateUserInput, User } from "../models/user.model";

const USER_PUBLIC_FIELDS = "id, name, email, created_at";

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select(USER_PUBLIC_FIELDS)
      .eq("email", email)
      .maybeSingle();

    if (error) {
      throw new AppException(
        "Não foi possível verificar o e-mail informado.",
        500,
        ErrorCodes.INTERNAL_ERROR,
        error.message
      );
    }

    return data ?? null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert({
        name: input.name,
        email: input.email,
        password: input.password,
      })
      .select(USER_PUBLIC_FIELDS)
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new AppException(
          "Este e-mail já está cadastrado.",
          409,
          ErrorCodes.CONFLICT
        );
      }

      throw new AppException(
        "Não foi possível registrar o usuário.",
        500,
        ErrorCodes.INTERNAL_ERROR,
        error.message
      );
    }

    return data;
  }
}
