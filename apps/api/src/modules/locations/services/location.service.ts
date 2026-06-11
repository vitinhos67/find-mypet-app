import { AlertService } from "../../alerts/services/alert.service";
import type { CreateLocationInput, DeviceLocationRecord } from "../models/location.model";
import { LocationRepository } from "../repositories/location.repository";

export class LocationService {
  constructor(
    private readonly locationRepository = new LocationRepository(),
    private readonly alertService = new AlertService()
  ) {}

  async saveForDevice(input: CreateLocationInput): Promise<DeviceLocationRecord> {
    const record = await this.locationRepository.save(input);

    if (record.pet_id) {
      this.checkSafeZone(record).catch(() => {});
    }

    return record;
  }

  private async checkSafeZone(record: DeviceLocationRecord): Promise<void> {
    if (!record.pet_id) return;

    // Busca o owner_id do pet para criar o alerta
    const { supabaseAdmin } = await import("../../../shared/supabase/supabaseAdmin.js");
    const { data: pet } = await supabaseAdmin
      .from("pets")
      .select("owner_id")
      .eq("id", record.pet_id)
      .maybeSingle();

    if (!pet?.owner_id) return;

    await this.alertService.checkAndCreateAlert(
      record.pet_id,
      pet.owner_id,
      record.latitude,
      record.longitude
    );
  }

  async getLastByPetId(petId: string): Promise<DeviceLocationRecord | null> {
    return this.locationRepository.findLastByPetId(petId);
  }

  async getLastByDeviceId(deviceId: string): Promise<DeviceLocationRecord | null> {
    return this.locationRepository.findLastByDeviceId(deviceId);
  }
}
