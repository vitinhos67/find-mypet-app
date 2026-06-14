import type { FastifyInstance } from "fastify";
import { authenticateSupabaseUser } from "../../../shared/middlewares/authenticate-supabase-user.middleware";
import { validateBody } from "../../../shared/middlewares/validate.middleware";
import { DeviceLocationBody, LocationController } from "../../locations/controllers/location.controller";
import { saveLocationBodySchema } from "../../locations/validators/save.validator";
import {
    CreateDeviceBody,
    DeviceController,
    LinkPetBody,
    UpdateDeviceBody
} from "../controllers/device.controller";

export async function deviceRoutes(app: FastifyInstance) {
    const deviceController = new DeviceController();
    const locationController = new LocationController();

    app.addHook("onRequest", async (request) => {
        if (request.method === "DELETE" || request.method === "GET") {
            delete request.headers["content-type"];
        }
    });

    app.get(
        "/",
        { preHandler: [authenticateSupabaseUser] },
        deviceController.list
    );

    app.post<{ Body: CreateDeviceBody }>(
        "/",
        { preHandler: [authenticateSupabaseUser] },
        deviceController.create
    );

    app.put<{ Params: { id: string }; Body: UpdateDeviceBody }>(
        "/:id",
        { preHandler: [authenticateSupabaseUser] },
        deviceController.update
    );

    app.delete<{ Params: { id: string } }>(
        "/:id",
        { preHandler: [authenticateSupabaseUser] },
        deviceController.delete
    );

    app.put<{ Params: { id: string }; Body: LinkPetBody }>(
        "/:id/link",
        { preHandler: [authenticateSupabaseUser] },
        deviceController.linkPet
    );

    // ESP32 envia coordenadas GPS da coleira
    app.post<{ Params: { id: string }; Body: DeviceLocationBody }>(
        "/:id/location",
        { preHandler: [validateBody(saveLocationBodySchema)] },
        locationController.saveForDevice
    );
    app.get<{ Params: { id: string } }>(
        "/:id/status",
        { preHandler: [authenticateSupabaseUser] },
        deviceController.getStatus
    );

    // App puxa o histórico de coordenadas para desenhar o mapa
    app.get<{ Params: { id: string }, Querystring: { limit?: string } }>(
        "/:id/locations",
        { preHandler: [authenticateSupabaseUser] },
        deviceController.getLocations
    );
}