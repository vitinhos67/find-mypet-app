import Fastify from "fastify";

export function buildServer() {
  const app = Fastify({
    logger: true,
  });

  app.get("/health", async () => {
    return {
      status: "ok",
      service: "find-mypet-api",
    };
  });

  return app;
}