import { FastifyReply, FastifyRequest } from "fastify";
import { DeviceService } from "../services/device.services";
export interface CreateDeviceBody {
    nome: string;
    serialNumber: string;
    wifiSsid: string;
    wifiSenha: string;
    intervaloAcordarMinutos: number;
    comportamentoSemWifi: string;
}

export interface UpdateDeviceBody {
    name: string;
    wifi_ssid: string;
    wifi_password: string;
    wake_interval: number;
    behavior_no_wifi: string;
}

export interface LinkPetBody {
    pet_id: string | null;
}

export class DeviceController {
    private deviceService: DeviceService;

    constructor() {
        this.deviceService = new DeviceService();
    }

    create = async (
        request: FastifyRequest<{ Body: CreateDeviceBody }>,
        reply: FastifyReply
    ) => {
        const ownerId = request.supabaseUser?.id;

        if (!ownerId) {
            return reply.status(401).send({ message: "Sessão inválida ou não autorizada." });
        }

        const {
            nome,
            serialNumber,
            wifiSsid,
            wifiSenha,
            intervaloAcordarMinutos,
            comportamentoSemWifi,
        } = request.body;

        try {
            const device = await this.deviceService.create({
                name: nome,
                serial_number: serialNumber,
                wifi_ssid: wifiSsid,
                wifi_password: wifiSenha,
                wake_interval: intervaloAcordarMinutos,
                behavior_no_wifi: comportamentoSemWifi,
                owner_id: ownerId,
            });

            return reply.status(201).send(device);
        } catch (error: any) {
            if (error?.code === "23505") {
                return reply.status(409).send({ message: "Este hardware já se encontra registrado numa conta." });
            }
            console.error("Erro no controller de device (Create):", error);
            return reply.status(500).send({ message: "Erro interno ao registrar a coleira.", error });
        }
    };

    list = async (
        request: FastifyRequest,
        reply: FastifyReply
    ) => {
        const ownerId = request.supabaseUser?.id;

        if (!ownerId) {
            return reply.status(401).send({ message: "Sessão inválida ou não autorizada." });
        }

        try {
            // Assumindo que seu DeviceService tem o método findManyByOwnerId
            const devices = await this.deviceService.findManyByOwnerId(ownerId);
            return reply.status(200).send(devices);
        } catch (error) {
            console.error("Erro no controller de device (List):", error);
            return reply.status(500).send({ message: "Erro ao buscar dispositivos.", error });
        }
    };

    update = async (
        request: FastifyRequest<{ Params: { id: string }; Body: UpdateDeviceBody }>,
        reply: FastifyReply
    ) => {
        const ownerId = request.supabaseUser?.id;
        const { id } = request.params;

        if (!ownerId) {
            return reply.status(401).send({ message: "Sessão inválida ou não autorizada." });
        }

        try {
            const updatedDevice = await this.deviceService.update(id, ownerId, request.body);
            return reply.status(200).send(updatedDevice);
        } catch (error) {
            console.error("Erro no controller de device (Update):", error);
            return reply.status(500).send({ message: "Erro ao atualizar dispositivo.", error });
        }
    };
    delete = async (
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) => {
        const ownerId = request.supabaseUser?.id;
        const { id } = request.params;

        if (!ownerId) {
            return reply.status(401).send({ message: "Sessão inválida ou não autorizada." });
        }

        try {
            await this.deviceService.delete(id, ownerId);
            return reply.status(200).send({ message: "Dispositivo removido com sucesso." });
        } catch (error) {
            console.error("Erro no controller de device (Delete):", error);
            return reply.status(500).send({ message: "Erro ao deletar dispositivo.", error });
        }
    };
    linkPet = async (
        request: FastifyRequest<{ Params: { id: string }; Body: LinkPetBody }>,
        reply: FastifyReply
    ) => {
        const ownerId = request.supabaseUser?.id;
        const { id } = request.params;
        const { pet_id } = request.body;

        if (!ownerId) {
            return reply.status(401).send({ message: "Sessão inválida ou não autorizada." });
        }

        try {
            await this.deviceService.linkPet(id, pet_id, ownerId);
            return reply.status(200).send({ message: "Vínculo atualizado com sucesso." });
        } catch (error) {
            console.error("Erro no controller de device (Link):", error);
            return reply.status(500).send({ message: "Erro ao vincular dispositivo ao pet.", error });
        }
    };
}