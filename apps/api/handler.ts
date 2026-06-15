import type { IncomingMessage, ServerResponse } from "node:http";
import { buildServer } from "./src/server";

type FastifyApp = Awaited<ReturnType<typeof buildServer>>;

let app: FastifyApp | null = null;

async function getApp(): Promise<FastifyApp> {
  if (!app) {
    app = await buildServer();
    await app.ready();
  }
  return app;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const fastify = await getApp();
  fastify.server.emit("request", req, res);
}
