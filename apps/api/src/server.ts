import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import Fastify from "fastify";

import { registerRoutes } from "./http/routes";
import { env } from "./shared/env/env";
import { registerErrorHandler } from "./shared/plugins/error-handler.plugin";

function getCorsOrigin() {
  if (!env.CORS_ORIGIN) {
    return env.NODE_ENV === "development";
  }

  return env.CORS_ORIGIN.split(",").map((origin) => origin.trim());
}

export async function buildServer() {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: getCorsOrigin(),
    credentials: true,
  });

  await app.register(cookie, {
    secret: env.SESSION_SECRET,
    hook: "onRequest",
  });

  registerErrorHandler(app);

  await app.register(registerRoutes);

  return app;
}
