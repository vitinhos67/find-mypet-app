import { AppException } from "../../../shared/exceptions/app.exception";
import { ErrorCodes } from "../../../shared/exceptions/error-codes";
import { supabaseAdmin } from "../../../shared/supabase/supabaseAdmin";
import type { CreateLocationInput, DeviceLocationRecord } from "../models/location.model";

const LOCATION_FIELDS = "id, device_id, latitude, longitude, precision, recorded_at";

export class LocationRepository {
  async save(input: CreateLocationInput): Promise<DeviceLocationRecord> {
    const { data, error } = await supabaseAdmin
      .from("device_locations")
      .insert({
        device_id: input.device_id,
        latitude: input.latitude,
        longitude: input.longitude,
        precision: input.precision ?? null,
      })
      .select(LOCATION_FIELDS)
      .single();

    if (error) {
      console.error("Erro Supabase (Location.save):", error);
      throw new AppException(
        "Não foi possível salvar a localização.",
        500,
        ErrorCodes.INTERNAL_ERROR,
        error.message
      );
    }

    return data;
  }

  async findLastByDeviceId(deviceId: string): Promise<DeviceLocationRecord | null> {
    const { data, error } = await supabaseAdmin
      .from("device_locations")
      .select(LOCATION_FIELDS)
      .eq("device_id", deviceId)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Erro Supabase (Location.findLastByDevice):", error);
      throw new AppException(
        "Não foi possível buscar a localização.",
        500,
        ErrorCodes.INTERNAL_ERROR,
        error.message
      );
    }

    return data;
  }

  async findLastByPetId(petId: string): Promise<DeviceLocationRecord | null> {
    // Busca a coleira vinculada ao pet
    const { data: device, error: deviceError } = await supabaseAdmin
      .from("devices")
      .select("id")
      .eq("pet_id", petId)
      .maybeSingle();

    if (deviceError || !device) return null;

    return this.findLastByDeviceId(device.id);
  }
}
