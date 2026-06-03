import { supabaseAdmin } from "../../../shared/supabase/supabaseAdmin";

const DEVICE_FIELDS =
    "id, owner_id, name, serial_number, wifi_ssid, wifi_password, wake_interval, behavior_no_wifi, pet_id, status, updated_at";

export class DeviceRepository {

    // O método continua se chamando "create" para não quebrar o Controller,
    // mas a lógica interna agora faz a Reivindicação (Claim) segura do hardware.
    async create(data: any): Promise<any> {
        // 1. Verifica se o serial digitado existe no banco (se foi fabricado) e se já tem dono
        const { data: existingDevice, error: fetchError } = await supabaseAdmin
            .from("devices")
            .select("id, owner_id")
            .eq("serial_number", data.serial_number)
            .single();

        if (fetchError || !existingDevice) {
            throw new Error("Serial inválido. Verifique o código na embalagem.");
        }

        // 2. Validação de Segurança: A coleira já foi registrada por outro cliente?
        if (existingDevice.owner_id !== null) {
            throw new Error("Este dispositivo já está registrado em outra conta.");
        }

        // 3. Tudo certo! Atualiza a coleira "virgem" com os dados do dono atual
        const { data: claimedDevice, error: updateError } = await supabaseAdmin
            .from("devices")
            .update({
                owner_id: data.owner_id,
                name: data.name,
                wifi_ssid: data.wifi_ssid,
                wifi_password: data.wifi_password,
                wake_interval: data.wake_interval,
                behavior_no_wifi: data.behavior_no_wifi,
                status: 'OFFLINE' // Garante que nasce offline até a placa pingar na API
            })
            .eq("id", existingDevice.id)
            .select(DEVICE_FIELDS)
            .single();

        if (updateError) throw updateError;
        return claimedDevice;
    }

    async findManyByOwnerId(ownerId: string): Promise<any[]> {
        const { data, error } = await supabaseAdmin
            .from("devices")
            .select(DEVICE_FIELDS)
            .eq("owner_id", ownerId)
            .order("updated_at", { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async update(id: string, ownerId: string, data: any): Promise<any> {
        const { data: updatedDevice, error } = await supabaseAdmin
            .from("devices")
            .update({
                name: data.name,
                wifi_ssid: data.wifi_ssid,
                wifi_password: data.wifi_password,
                wake_interval: data.wake_interval,
                behavior_no_wifi: data.behavior_no_wifi,
            })
            .eq("id", id)
            .eq("owner_id", ownerId)
            .select(DEVICE_FIELDS)
            .single();

        if (error) {
            console.error("Erro no Repositório de Update:", error);
            throw error;
        }
        return updatedDevice;
    }

    async delete(id: string, ownerId: string): Promise<void> {
        // Ao excluir a coleira do aplicativo, em vez de deletar do banco (o que destruiria
        // o registro da fábrica), nós "limpamos" a coleira para ela voltar a ser virgem
        // e poder ser revendida ou repassada para outro dono.
        const { error } = await supabaseAdmin
            .from("devices")
            .update({
                owner_id: null,
                pet_id: null,
                name: null,
                wifi_ssid: null,
                wifi_password: null,
                status: 'OFFLINE'
            })
            .eq("id", id)
            .eq("owner_id", ownerId);

        if (error) throw error;
    }

    async updateLink(id: string, petId: string | null, ownerId: string): Promise<void> {
        if (petId !== null) {
            const { error: unlinkError } = await supabaseAdmin
                .from("devices")
                .update({ pet_id: null })
                .eq("pet_id", petId)
                .eq("owner_id", ownerId);

            if (unlinkError) {
                console.error("Erro ao desvincular pet da coleira antiga:", unlinkError);
                throw unlinkError;
            }
        }

        const { error } = await supabaseAdmin
            .from("devices")
            .update({ pet_id: petId })
            .eq("id", id)
            .eq("owner_id", ownerId);

        if (error) {
            console.error("Erro ao vincular pet na nova coleira:", error);
            throw error;
        }
    }
}