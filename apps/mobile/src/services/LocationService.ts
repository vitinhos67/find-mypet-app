import { PetLocation } from '../models/location.model';
import { ApiService } from './ApiService';

export class LocationService {
    static async getLastLocation(petId: string): Promise<PetLocation | null> {
        try {
            const response: any = await ApiService.get(`/pets/${petId}/location`);
            const location: PetLocation = response?.data ?? response;
            if (location?.latitude == null) return null;
            return location;
        } catch {
            return null;
        }
    }
}
