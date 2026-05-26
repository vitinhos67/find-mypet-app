import type { FastifyReply, FastifyRequest } from "fastify";

import { AppException } from "../exceptions/app.exception";
import { ErrorCodes } from "../exceptions/error-codes";
import { supabaseAdmin } from "../supabase/supabaseAdmin";


export async function authenticateSupabaseUser(
    request: FastifyRequest,
    _reply: FastifyReply,
) {
    const authorization = request.headers.authorization;

    if (!authorization) {
        throw new AppException(
            "Token de autenticação não informado.",
            401,
            ErrorCodes.UNAUTHORIZED,
        );
    }

    const [type, token] = authorization.split(" ");

    if (type !== "Bearer" || !token) {
        throw new AppException(
            "Formato de autenticação inválido.",
            401,
            ErrorCodes.UNAUTHORIZED,
        );
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
        throw new AppException(
            "Sessão inválida ou expirada.",
            401,
            ErrorCodes.UNAUTHORIZED,
            error?.message,
        );
    }

    request.supabaseUser = data.user;
}
