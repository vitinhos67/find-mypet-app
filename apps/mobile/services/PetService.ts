import { PetLocalRepository } from '../src/database';
import { Pet, PetPayload, PetResponse, SexoPet } from '../src/models/pet.model';
import { ApiService } from './ApiService';
import { AuthService } from './AuthService';

type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
};

type ApiPetResponse = Partial<PetResponse> & {
    id: string;
    image_href?: string | null;
    name?: string | null;
    raca?: string | null;
    cor?: string | null;
    sexo?: SexoPet | null;
    descricao?: string | null;
};

export class PetService {
    static async createPet(data: PetPayload) {
        return await ApiService.post<PetResponse>('/pets', data);
    }

    static async getPets(): Promise<Pet[]> {
        const response = await ApiService.get<
            ApiResponse<ApiPetResponse[]> | ApiPetResponse[]
        >('/pets');
        return this.getPetsData(response).map(pet => this.toPetCache(pet));
    }

    static async getPetById(id: string): Promise<Pet | null> {
        try {
            const response = await ApiService.get<
                { success: boolean; data: ApiPetResponse } | ApiPetResponse
            >(`/pets/${id}`);
            const raw = 'data' in response && response.data
                ? (response as { success: boolean; data: ApiPetResponse }).data
                : response as ApiPetResponse;
            const pet = this.toPetCache(raw);

            const userId = await AuthService.getCurrentUserId();
            if (userId) {
                await PetLocalRepository.upsert(userId, pet);
            }

            return pet;
        } catch (error) {
            console.log('Erro ao carregar detalhe do pet pela API:', error);

            const userId = await AuthService.getCurrentUserId();
            if (!userId) {
                throw error;
            }

            return PetLocalRepository.findById(userId, id);
        }
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

    private static getPetsData(
        response: ApiResponse<ApiPetResponse[]> | ApiPetResponse[]
    ) {
        return Array.isArray(response) ? response : response.data || [];
    }

    static toPetCache(pet: ApiPetResponse): Pet {
        return {
            id: pet.id,
            foto: pet.image_href ?? pet.foto,
            nome: pet.name ?? pet.nome ?? '',
            raca: pet.raca ?? '',
            cor: pet.cor ?? '',
            sexo: (pet.sexo ?? 'MACHO') as SexoPet,
            descricao: pet.descricao ?? '',
        };
    }
}
