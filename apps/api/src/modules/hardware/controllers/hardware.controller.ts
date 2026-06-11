import { FastifyReply, FastifyRequest } from "fastify";
import { supabaseAdmin } from "../../../shared/supabase/supabaseAdmin";

export class HardwareController {

    getConfig = async (req: FastifyRequest<{ Params: { serial: string } }>, reply: FastifyReply) => {
        const { serial } = req.params;

        const { data: device, error } = await supabaseAdmin
            .from("devices")
            // 🔥 ADICIONE A COLUNA DE INTERVALO AQUI (ex: update_interval)
            .select("behavior_no_wifi, wifi_ssid, wifi_password, wake_interval")
            .eq("serial_number", serial)
            .single();

        if (error || !device) {
            console.error("❌ ERRO AO BUSCAR CONFIGURAÇÕES:", error);
            return reply.status(404).send({ message: "Dispositivo não encontrado." });
        }

        return reply.status(200).send({
            behavior_no_wifi: device.behavior_no_wifi || "RASTREIO_ATIVO",
            wifi_ssid: device.wifi_ssid || "",
            wifi_password: device.wifi_password || "",
            // 🔥 MANDA PRO ESP32 O NÚMERO QUE O APP SALVOU (Padrão: 1 minuto)
            wake_interval: device.wake_interval || 1
        });
    };
    ping = async (req: FastifyRequest<{ Params: { serial: string }, Body: { battery_level?: number } }>, reply: FastifyReply) => {
        const { serial } = req.params;
        const { battery_level } = req.body;
        const updatePayload: any = {
            status: 'ONLINE',
            updated_at: new Date().toISOString()
        };

        if (typeof battery_level === 'number') {
            updatePayload.battery_level = battery_level;
        }

        const { error } = await supabaseAdmin
            .from("devices")
            .update(updatePayload)
            .eq("serial_number", serial);

        if (error) return reply.status(500).send({ message: "Erro no registro de ping.", error });

        return reply.status(200).send({ message: "Ping ok." });
    };

    saveLocation = async (
        req: FastifyRequest<{ Params: { serial: string }, Body: { latitude: number, longitude: number, precision?: number, battery_level?: number } }>,
        reply: FastifyReply
    ) => {
        const { serial } = req.params;
        const { latitude, longitude, battery_level } = req.body;

        const { data: device, error: fetchError } = await supabaseAdmin
            .from("devices")
            .select("id, pet_id")
            .eq("serial_number", serial)
            .single();

        if (fetchError || !device) return reply.status(404).send({ message: "Dispositivo não encontrado." });

        const { error: insertError } = await supabaseAdmin
            .from("device_locations")
            .insert({
                device_id: device.id,
                pet_id: device.pet_id,
                latitude,
                longitude
            });

        if (insertError) {
            console.error("❌ ERRO AO SALVAR GPS:", insertError);
            return reply.status(500).send({ message: "Erro ao salvar coordenada." });
        }

        // 🔥 ATUALIZANDO STATUS E BATERIA (Com log de erro)
        const updatePayload: any = { status: 'ONLINE', updated_at: new Date().toISOString() };

        if (battery_level !== undefined) {
            // A maioria dos esquemas Supabase usa battery_level, atualize aqui se a sua coluna tiver outro nome
            updatePayload.battery_level = battery_level;
        }

        const { error: updateError } = await supabaseAdmin
            .from("devices")
            .update(updatePayload)
            .eq("id", device.id);

        if (updateError) {
            console.error("\n❌ ERRO DO SUPABASE AO SALVAR BATERIA:", updateError.message);
            console.error("-> DICA: Verifique se a coluna na tabela 'devices' se chama 'battery_level' ou apenas 'battery'.\n");
        } else {
            console.log(`✅ [ESP32] Bateria (${battery_level}%) e Status atualizados no banco!`);
        }

        return reply.status(201).send({ message: "GPS e Bateria processados." });
    };
}