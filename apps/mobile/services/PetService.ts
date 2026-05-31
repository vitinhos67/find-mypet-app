import { PetPayload, PetResponse } from '../models/pet.model';
import { ApiService } from './ApiService';

export class PetService {
    static async createPet(data: PetPayload) {
        return await ApiService.post<PetResponse>('/pets', data);
    }

    static async getPets() {
        return await ApiService.get<PetResponse[]>('/pets');
    }

    static async updatePet(id: string, data: PetPayload) {
        return await ApiService.request<PetResponse>(`/pets/${id}`, {
            method: 'PUT',
            body: data
        });
    }

    static async deletePet(id: string) {
        return await ApiService.request<{ success: boolean }>(`/pets/${id}`, {
            method: 'DELETE'
        });
    }
}