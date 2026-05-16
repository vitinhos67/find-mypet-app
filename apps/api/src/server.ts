import Fastify from "fastify";

import { registerRoutes } from "./http/routes";

export async function buildServer() {
  const app = Fastify({
    logger: true,
  });

  await app.register(registerRoutes);

  app.get("/health", async () => {
    return {
      status: "ok",
      service: "find-mypet-api",
    };
  });

  return app;
}
