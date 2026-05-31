import { FastifyInstance } from 'fastify';
import { authenticateSupabaseUser } from '../../../shared/middlewares/authenticate-supabase-user.middleware';
import { DeviceController } from '../controllers/device.controller';

export async function deviceRoutes(app: FastifyInstance) {
    const deviceController = new DeviceController();
    app.addHook('onRequest', authenticateSupabaseUser);

    app.post('/', deviceController.create.bind(deviceController));
    app.get('/', deviceController.list.bind(deviceController));
}