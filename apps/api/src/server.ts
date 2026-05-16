import Fastify from "fastify";

import { registerRoutes } from "./http/routes";
import { registerErrorHandler } from "./shared/plugins/error-handler.plugin";

export async function buildServer() {
  const app = Fastify({
    logger: true,
  });

  registerErrorHandler(app);

  await app.register(registerRoutes);

  return app;
}
