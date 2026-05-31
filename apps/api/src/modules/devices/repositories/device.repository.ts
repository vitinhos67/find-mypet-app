import { supabaseAdmin } from "../../../shared/supabase/supabaseAdmin"; // Ajuste o caminho se o seu supabaseAdmin ficar em outro lugar

export class DeviceRepository {
    async create(data: any): Promise<any> {
        const { data: newDevice, error } = await supabaseAdmin
            .from("devices")
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return newDevice;
    }

    async findManyByOwnerId(ownerId: string): Promise<any[]> {
        const { data, error } = await supabaseAdmin
            .from("devices")
            .select("*")
            .eq("owner_id", ownerId)
            .order("created_at", { ascending: false }); // Garante que a coluna que criamos agora é usada

        if (error) throw error;
        return data || [];
    }

    async update(id: string, ownerId: string, data: any): Promise<any> {
        const { data: updatedDevice, error } = await supabaseAdmin
            .from("devices")
            .update({
                name: data.name, // Ajustado para 'name'
                wifi_ssid: data.wifi_ssid,
                wifi_password: data.wifi_password, // Ajustado para 'wifi_password'
                wake_interval: data.wake_interval, // Ajustado para 'wake_interval'
                behavior_no_wifi: data.behavior_no_wifi, // Ajustado para 'behavior_no_wifi'
            })
            .eq("id", id)
            .eq("owner_id", ownerId)
            .select()
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
        const { error } = await supabaseAdmin
            .from("devices")
            .update({ pet_id: petId })
            .eq("id", id)
            .eq("owner_id", ownerId);

        if (error) throw error;
    }
}