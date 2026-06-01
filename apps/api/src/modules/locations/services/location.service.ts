import type { CreateLocationInput, DeviceLocationRecord } from "../models/location.model";
import { LocationRepository } from "../repositories/location.repository";

export class LocationService {
  constructor(private readonly locationRepository = new LocationRepository()) {}

  async saveForDevice(input: CreateLocationInput): Promise<DeviceLocationRecord> {
    return this.locationRepository.save(input);
  }

  async getLastByPetId(petId: string): Promise<DeviceLocationRecord | null> {
    return this.locationRepository.findLastByPetId(petId);
  }

  async getLastByDeviceId(deviceId: string): Promise<DeviceLocationRecord | null> {
    return this.locationRepository.findLastByDeviceId(deviceId);
  }
}
