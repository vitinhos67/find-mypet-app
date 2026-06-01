import { haversineDistance } from "../../../shared/utils/haversine";
import { SafeZoneRepository } from "../../safe-zones/repositories/safe-zone.repository";
import type { Alert } from "../models/alert.model";
import { AlertRepository } from "../repositories/alert.repository";

export class AlertService {
  constructor(
    private readonly alertRepo = new AlertRepository(),
    private readonly zoneRepo = new SafeZoneRepository()
  ) {}

  async checkAndCreateAlert(
    petId: string,
    ownerId: string,
    latitude: number,
    longitude: number
  ): Promise<Alert | null> {
    const zone = await this.zoneRepo.findActiveByPetId(petId);
    if (!zone) return null;

    const distance = haversineDistance(zone.latitude, zone.longitude, latitude, longitude);
    if (distance <= zone.radius_meters) return null;

    return this.alertRepo.createIfNotRecent(petId, ownerId, latitude, longitude);
  }

  async getUnread(ownerId: string): Promise<Alert[]> {
    return this.alertRepo.findUnreadByOwner(ownerId);
  }

  async markAllRead(ownerId: string): Promise<void> {
    return this.alertRepo.markAllRead(ownerId);
  }

  async markRead(alertId: string, ownerId: string): Promise<void> {
    return this.alertRepo.markRead(alertId, ownerId);
  }
}
