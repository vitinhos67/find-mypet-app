import { Alert, SafeZone } from '../models/safe-zone.model';
import { ApiService } from './ApiService';

export class SafeZoneService {
    static async get(petId: string) {
        return ApiService.get<SafeZone | null>(`/pets/${petId}/safe-zone`);
    }

    static async upsert(
        petId: string,
        data: { name: string; latitude: number; longitude: number; radius_meters: number; is_active: boolean }
    ) {
        return ApiService.post<SafeZone>(`/pets/${petId}/safe-zone`, data);
    }

    static async remove(petId: string) {
        return ApiService.request<null>(`/pets/${petId}/safe-zone`, { method: 'DELETE' });
    }

    static async getAlerts() {
        return ApiService.get<Alert[]>('/alerts');
    }

    static async markAllRead() {
        return ApiService.request<null>('/alerts/read-all', { method: 'PATCH' });
    }

    static async markRead(alertId: string) {
        return ApiService.request<null>(`/alerts/${alertId}/read`, { method: 'PATCH' });
    }
}
