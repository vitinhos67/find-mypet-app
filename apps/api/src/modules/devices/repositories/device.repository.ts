import { supabaseAdmin } from "../../../shared/supabase/supabaseAdmin";

const DEVICE_FIELDS =
    "id, owner_id, name, serial_number, wifi_ssid, wifi_password, wake_interval, behavior_no_wifi, pet_id, status, updated_at";

export class DeviceRepository {
    async create(data: any): Promise<any> {
        const { data: newDevice, error } = await supabaseAdmin
            .from("devices")
            .insert(data)
            .select(DEVICE_FIELDS)
            .single();

        if (error) throw error;
        return newDevice;
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
        const { error } = await supabaseAdmin
            .from("devices")
            .delete()
            .eq("id", id)
            .eq("owner_id", ownerId);

        if (error) throw error;
    }

    async updateLink(id: string, petId: string | null, ownerId: string): Promise<void> {
        // PASSO 1: Se estivermos vinculando um pet (petId não é null),
        // removemos este pet de qualquer outra coleira que ele já possua.
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

        // PASSO 2: Agora que o pet está livre, vinculamos ele na coleira correta.
        // (Isso também funciona perfeitamente para quando o usuário apenas clica em "Desvincular", onde petId é null)
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