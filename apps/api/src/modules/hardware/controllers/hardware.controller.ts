import { FastifyReply, FastifyRequest } from "fastify";
import { supabaseAdmin } from "../../../shared/supabase/supabaseAdmin";

export class HardwareController {

    // GET /api/hardware/:serial/config
    getConfig = async (request: FastifyRequest<{ Params: { serial: string } }>, reply: FastifyReply) => {
        const { serial } = request.params;

        const { data: device, error } = await supabaseAdmin
            .from("devices")
            .select("id, wifi_ssid, wifi_password, wake_interval, behavior_no_wifi")
            .eq("serial_number", serial)
            .single();

        if (error || !device) {
            return reply.status(404).send({ message: "Dispositivo não encontrado ou não cadastrado." });
        }

        // Devolve o JSON exatamente no formato que o C++ do ESP32 vai esperar
        return reply.status(200).send({
            deviceId: device.id,
            wifiSsid: device.wifi_ssid,
            wifiSenha: device.wifi_password,
            intervaloAcordarMinutos: device.wake_interval,
            comportamentoSemWifi: device.behavior_no_wifi
        });
    };

    // POST /api/hardware/:serial/ping
    ping = async (request: FastifyRequest<{ Params: { serial: string } }>, reply: FastifyReply) => {
        const { serial } = request.params;

        // O ESP32 achou o Wi-Fi. Apenas atualizamos o status para ONLINE.
        // NOTA: Isso não mexe na tabela de coordenadas, então o último pino do mapa fica intacto!
        const { error } = await supabaseAdmin
            .from("devices")
            .update({ status: 'ONLINE', updated_at: new Date().toISOString() })
            .eq("serial_number", serial);

        if (error) {
            return reply.status(500).send({ message: "Erro ao registrar ping.", error });
        }

        return reply.status(200).send({ message: "Ping registrado. O pet está na zona do Wi-Fi." });
    };

    // POST /api/hardware/:serial/location
    saveLocation = async (
        request: FastifyRequest<{ Params: { serial: string }, Body: { latitude: number, longitude: number, precision?: number } }>,
        reply: FastifyReply
    ) => {
        const { serial } = request.params;
        const { latitude, longitude, precision } = request.body;

        // 1. Descobre qual é o ID interno do device e em qual pet ele está pendurado hoje
        const { data: device, error: fetchError } = await supabaseAdmin
            .from("devices")
            .select("id, pet_id")
            .eq("serial_number", serial)
            .single();

        if (fetchError || !device) {
            return reply.status(404).send({ message: "Dispositivo não encontrado." });
        }

        // 2. Grava a nova coordenada geográfica na tabela de histórico
        const { error: insertError } = await supabaseAdmin
            .from("device_locations")
            .insert({
                device_id: device.id,
                pet_id: device.pet_id,
                latitude,
                longitude,
                accuracy: precision || null
            });

        if (insertError) {
            return reply.status(500).send({ message: "Erro interno ao salvar coordenada.", error: insertError });
        }

        // 3. Aproveita para avisar que a coleira está ONLINE
        await supabaseAdmin
            .from("devices")
            .update({ status: 'ONLINE', updated_at: new Date().toISOString() })
            .eq("id", device.id);

        return reply.status(201).send({ message: "Localização GPS salva com sucesso." });
    };
}