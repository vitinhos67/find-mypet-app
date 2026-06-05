import { FastifyReply, FastifyRequest } from "fastify";
import { supabaseAdmin } from "../../../shared/supabase/supabaseAdmin";

export class HardwareController {

    getConfig = async (req: FastifyRequest<{ Params: { serial: string } }>, reply: FastifyReply) => {
        const { serial } = req.params;

        const { data: device, error } = await supabaseAdmin
            .from("devices")
            .select("id, wifi_ssid, wifi_password, wake_interval, behavior_no_wifi")
            .eq("serial_number", serial)
            .single();

        if (error || !device) {
            return reply.status(404).send({ message: "Dispositivo não encontrado." });
        }

        return reply.status(200).send({
            device_id: device.id,
            wifi_ssid: device.wifi_ssid,
            wifi_password: device.wifi_password,
            wake_interval: device.wake_interval,
            behavior_no_wifi: device.behavior_no_wifi
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
        req: FastifyRequest<{ Params: { serial: string }, Body: { latitude: number, longitude: number, precision?: number } }>,
        reply: FastifyReply
    ) => {
        const { serial } = req.params;
        const { latitude, longitude, precision } = req.body;

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
            console.error("DEBUG SUPABASE ERROR:", JSON.stringify(insertError, null, 2));
            return reply.status(500).send({ message: "Erro ao salvar coordenada.", details: insertError });
        }

        return reply.status(201).send({ message: "GPS salvo." });
    };
}