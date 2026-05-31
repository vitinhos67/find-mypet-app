import { PetLocation } from '../models/location.model';
import { ApiService } from './ApiService';

export class LocationService {
    static async getLastLocation(petId: string): Promise<PetLocation | null> {
        try {
            return await ApiService.get<PetLocation>(`/pets/${petId}/location`);
        } catch {
            return null;
        }
    }
}
