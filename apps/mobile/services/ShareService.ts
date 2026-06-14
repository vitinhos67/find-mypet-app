import { PetShare, SharedPetResponse, SharePermission } from '../src/models/pet.model';
import { ApiService } from './ApiService';

export class ShareService {
    static async sharePet(petId: string, email: string, permission: SharePermission) {
        return await ApiService.post<PetShare>(`/pets/${petId}/shares`, { email, permission });
    }

    static async listShares(petId: string) {
        return await ApiService.get<PetShare[]>(`/pets/${petId}/shares`);
    }

    static async removeShare(petId: string, shareId: string) {
        return await ApiService.request<{ success: boolean }>(`/pets/${petId}/shares/${shareId}`, {
            method: 'DELETE'
        });
    }

    static async updatePermission(petId: string, shareId: string, permission: SharePermission) {
        return await ApiService.request<PetShare>(`/pets/${petId}/shares/${shareId}`, {
            method: 'PATCH',
            body: { permission }
        });
    }

    static async getSharedWithMe() {
        return await ApiService.get<SharedPetResponse[]>('/shares');
    }
}
