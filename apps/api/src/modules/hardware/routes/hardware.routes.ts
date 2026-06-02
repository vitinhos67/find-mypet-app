import { FastifyInstance } from "fastify";
import { HardwareController } from "../controllers/hardware.controller";

const hardwareController = new HardwareController();

export async function hardwareRoutes(app: FastifyInstance) {
    // Estas rotas são PÚBLICAS para o ESP32 conseguir acessar. 
    // A "senha" é o serial number estar correto na URL.
    app.get("/:serial/config", hardwareController.getConfig);
    app.post("/:serial/ping", hardwareController.ping);
    app.post("/:serial/location", hardwareController.saveLocation);
}