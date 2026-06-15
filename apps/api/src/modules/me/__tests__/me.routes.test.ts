import type { FastifyInstance } from "fastify";
import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL = "https://test.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
process.env.SESSION_SECRET = "12345678901234567890123456789012";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  gender: string | null;
  avatar_url: string | null;
  updated_at: string | null;
};

type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

let buildServer: () => Promise<FastifyInstance>;
let supabaseAdmin: {
  auth: {
    getUser: (token: string) => Promise<unknown>;
  };
  from: (table: string) => unknown;
};

const authUser: SupabaseUser = {
  id: "user-1",
  email: "user@test.com",
  user_metadata: {
    name: "Usuario Teste",
    telefone: "11999999999",
    genero: "Masculino",
  },
};

const existingProfile: Profile = {
  id: "user-1",
  full_name: "Usuario Teste",
  email: "user@test.com",
  phone: "11999999999",
  gender: "Masculino",
  avatar_url: "user-1/avatar.jpg",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const state: {
  app: FastifyInstance | null;
  authResult: { data: { user: SupabaseUser | null }; error: { message: string } | null };
  profile: Profile | null;
  insertInput: Record<string, unknown> | null;
  updateInput: Record<string, unknown> | null;
} = {
  app: null,
  authResult: {
    data: { user: authUser },
    error: null,
  },
  profile: existingProfile,
  insertInput: null,
  updateInput: null,
};

function makeProfileFromInput(input: Record<string, unknown>): Profile {
  return {
    id: String(input.id),
    full_name: (input.full_name as string | null | undefined) ?? null,
    email: (input.email as string | null | undefined) ?? null,
    phone: (input.phone as string | null | undefined) ?? null,
    gender: (input.gender as string | null | undefined) ?? null,
    avatar_url: (input.avatar_url as string | null | undefined) ?? null,
    updated_at: (input.updated_at as string | null | undefined) ?? null,
  };
}

function installSupabaseStubs() {
  (supabaseAdmin.auth.getUser as unknown as (token: string) => Promise<unknown>) =
    async () => state.authResult;

  (supabaseAdmin as unknown as { from: (table: string) => unknown }).from = (
    table: string
  ) => {
    assert.equal(table, "profiles");

    return {
      select: () => ({
        eq: (_column: string, id: string) => ({
          maybeSingle: async () => ({
            data: state.profile?.id === id ? state.profile : null,
            error: null,
          }),
        }),
      }),
      insert: (input: Record<string, unknown>) => {
        state.insertInput = input;

        return {
          select: () => ({
            single: async () => {
              const profile = makeProfileFromInput(input);
              state.profile = profile;

              return {
                data: profile,
                error: null,
              };
            },
          }),
        };
      },
      update: (input: Record<string, unknown>) => {
        state.updateInput = input;

        return {
          eq: (_column: string, id: string) => ({
            select: () => ({
              single: async () => {
                const profile = {
                  ...(state.profile ?? existingProfile),
                  ...input,
                  id,
                } as Profile;
                state.profile = profile;

                return {
                  data: profile,
                  error: null,
                };
              },
            }),
          }),
        };
      },
    };
  };
}

function authHeader(token = "valid-token") {
  return {
    authorization: `Bearer ${token}`,
  };
}

describe("Rotas /api/me", () => {
  before(async () => {
    const serverModule = await import("../../../app.js");
    const supabaseModule = await import("../../../shared/supabase/supabaseAdmin.js");

    buildServer = serverModule.buildServer;
    supabaseAdmin = supabaseModule.supabaseAdmin as unknown as typeof supabaseAdmin;
  });

  beforeEach(async () => {
    state.authResult = {
      data: { user: authUser },
      error: null,
    };
    state.profile = existingProfile;
    state.insertInput = null;
    state.updateInput = null;

    installSupabaseStubs();
    state.app = await buildServer();
  });

  after(() => {
    delete process.env.CORS_ORIGIN;
  });

  afterEach(async () => {
    await state.app?.close();
    state.app = null;
  });

  it("GET /api/me deve retornar 401 sem header Authorization", async () => {
    const response = await state.app!.inject({
      method: "GET",
      url: "/api/me",
    });
    const body = response.json();

    assert.equal(response.statusCode, 401);
    assert.equal(body.success, false);
    assert.equal(body.error.code, "UNAUTHORIZED");
  });

  it("GET /api/me deve retornar 401 com header Authorization malformado", async () => {
    const response = await state.app!.inject({
      method: "GET",
      url: "/api/me",
      headers: {
        authorization: "Token invalid",
      },
    });
    const body = response.json();

    assert.equal(response.statusCode, 401);
    assert.equal(body.success, false);
    assert.equal(body.error.code, "UNAUTHORIZED");
  });

  it("GET /api/me deve retornar 401 quando o token falhar no Supabase", async () => {
    state.authResult = {
      data: { user: null },
      error: { message: "Invalid token" },
    };

    const response = await state.app!.inject({
      method: "GET",
      url: "/api/me",
      headers: authHeader("invalid-token"),
    });
    const body = response.json();

    assert.equal(response.statusCode, 401);
    assert.equal(body.success, false);
    assert.equal(body.error.code, "UNAUTHORIZED");
  });

  it("GET /api/me deve retornar usuário autenticado e perfil existente", async () => {
    const response = await state.app!.inject({
      method: "GET",
      url: "/api/me",
      headers: authHeader(),
    });
    const body = response.json();

    assert.equal(response.statusCode, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.id, "user-1");
    assert.equal(body.data.email, "user@test.com");
    assert.equal(body.data.profile.id, "user-1");
    assert.equal(body.data.profile.full_name, "Usuario Teste");
    assert.equal(state.insertInput, null);
  });

  it("GET /api/me deve criar e retornar perfil quando ele não existir", async () => {
    state.profile = null;

    const response = await state.app!.inject({
      method: "GET",
      url: "/api/me",
      headers: authHeader(),
    });
    const body = response.json();

    assert.equal(response.statusCode, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.profile.id, "user-1");
    assert.equal(body.data.profile.full_name, "Usuario Teste");
    assert.equal(body.data.profile.email, "user@test.com");
    assert.equal(state.insertInput?.id, "user-1");
  });

  it("PATCH /api/me/profile deve retornar 401 sem header Authorization", async () => {
    const response = await state.app!.inject({
      method: "PATCH",
      url: "/api/me/profile",
      payload: {
        full_name: "Novo Nome",
      },
    });
    const body = response.json();

    assert.equal(response.statusCode, 401);
    assert.equal(body.success, false);
    assert.equal(body.error.code, "UNAUTHORIZED");
  });

  it("PATCH /api/me/profile deve retornar 400 para telefone inválido", async () => {
    const response = await state.app!.inject({
      method: "PATCH",
      url: "/api/me/profile",
      headers: authHeader(),
      payload: {
        phone: "123",
      },
    });
    const body = response.json();

    assert.equal(response.statusCode, 400);
    assert.equal(body.success, false);
    assert.equal(body.error.code, "VALIDATION_ERROR");
  });

  it("PATCH /api/me/profile deve retornar 400 para gênero inválido", async () => {
    const response = await state.app!.inject({
      method: "PATCH",
      url: "/api/me/profile",
      headers: authHeader(),
      payload: {
        gender: "Invalido",
      },
    });
    const body = response.json();

    assert.equal(response.statusCode, 400);
    assert.equal(body.success, false);
    assert.equal(body.error.code, "VALIDATION_ERROR");
  });

  it("PATCH /api/me/profile deve retornar 200 ao atualizar campos válidos", async () => {
    const response = await state.app!.inject({
      method: "PATCH",
      url: "/api/me/profile",
      headers: authHeader(),
      payload: {
        full_name: "Nome Atualizado",
        phone: "11888888888",
        gender: "Outro",
        avatar_url: "user-1/new-avatar.jpg",
      },
    });
    const body = response.json();

    assert.equal(response.statusCode, 200);
    assert.equal(body.success, true);
    assert.equal(body.message, "Perfil atualizado com sucesso.");
    assert.equal(state.updateInput?.full_name, "Nome Atualizado");
    assert.equal(state.updateInput?.phone, "11888888888");
  });

  it("PATCH /api/me/profile deve retornar os dados atualizados do perfil", async () => {
    const response = await state.app!.inject({
      method: "PATCH",
      url: "/api/me/profile",
      headers: authHeader(),
      payload: {
        full_name: "Perfil Retornado",
        phone: null,
        gender: "Feminino",
      },
    });
    const body = response.json();

    assert.equal(response.statusCode, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.id, "user-1");
    assert.equal(body.data.full_name, "Perfil Retornado");
    assert.equal(body.data.phone, null);
    assert.equal(body.data.gender, "Feminino");
  });
});
