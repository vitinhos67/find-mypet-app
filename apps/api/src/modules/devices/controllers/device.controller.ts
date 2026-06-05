import { FastifyReply, FastifyRequest } from "fastify";
import { supabaseAdmin } from "../../../shared/supabase/supabaseAdmin";
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
            // Se o erro vier com a nossa mensagem customizada do repositório,
            // nós devolvemos com status 400 para o App conseguir ler e exibir.
            if (error instanceof Error) {
                return reply.status(400).send({ message: error.message });
            }

            // Se for um erro bizarro do servidor, aí sim devolve 500.
            console.error("Erro interno:", error);
            return reply.status(500).send({ message: "Falha interna ao registrar coleira." });
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
    getStatus = async (
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) => {
        const ownerId = request.supabaseUser?.id;
        const { id } = request.params;

        if (!ownerId) return reply.status(401).send({ message: "Não autorizada." });

        try {
            const { data: device, error } = await supabaseAdmin
                .from("devices")
                .select("status, updated_at, wake_interval, battery_level")
                .eq("id", id)
                .eq("owner_id", ownerId)
                .single();

            if (error || !device) return reply.status(404).send({ message: "Dispositivo não encontrado." });

            // MOTOR OFFLINE (Regra da Morte)
            const lastPing = new Date(device.updated_at).getTime();
            const now = Date.now();
            const intervalMs = device.wake_interval * 60 * 1000;
            const gracePeriodMs = 2 * 60 * 1000; // 2 min de tolerância

            const isActuallyOffline = (now - lastPing) > (intervalMs + gracePeriodMs);

            if (device.status === 'ONLINE' && isActuallyOffline) {
                // Atualiza no banco silenciosamente
                await supabaseAdmin.from("devices").update({ status: 'OFFLINE' }).eq("id", id);

                return reply.status(200).send({
                    status: 'OFFLINE',
                    battery_level: device.battery_level,
                    last_seen: device.updated_at
                });
            }

            return reply.status(200).send({
                status: device.status,
                battery_level: device.battery_level,
                last_seen: device.updated_at
            });
        } catch (error) {
            console.error("Erro no controller de device (Status):", error);
            return reply.status(500).send({ message: "Erro ao buscar status." });
        }
    };

    getLocations = async (
        request: FastifyRequest<{ Params: { id: string }, Querystring: { limit?: string } }>,
        reply: FastifyReply
    ) => {
        const ownerId = request.supabaseUser?.id;
        const { id } = request.params;
        const limit = request.query.limit ? parseInt(request.query.limit) : 50;

        if (!ownerId) return reply.status(401).send({ message: "Não autorizada." });

        try {
            // Verifica se a coleira pertence ao usuário antes de liberar o mapa
            const { data: device } = await supabaseAdmin
                .from("devices")
                .select("id")
                .eq("id", id)
                .eq("owner_id", ownerId)
                .single();

            if (!device) return reply.status(403).send({ message: "Acesso negado." });

            const { data: locations, error } = await supabaseAdmin
                .from("device_locations")
                .select("latitude, longitude, created_at, accuracy")
                .eq("device_id", id)
                .order("created_at", { ascending: false })
                .limit(limit);

            if (error) throw error;

            return reply.status(200).send(locations);
        } catch (error) {
            console.error("Erro no controller de device (Locations):", error);
            return reply.status(500).send({ message: "Erro ao buscar mapa." });
        }
    };
}