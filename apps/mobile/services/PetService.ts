import { PetLocalRepository } from '../database';
import { Pet, PetPayload, PetResponse, SexoPet } from '../models/pet.model';
import { supabase } from '../src/shared/lib/supabase';
import { ApiService } from './ApiService';

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
        try {
            const response = await ApiService.get<
                ApiResponse<ApiPetResponse[]> | ApiPetResponse[]
            >('/pets');
            const pets = this.getPetsData(response)
                .map((pet) => this.toPetCache(pet));
            const userId = await this.getAuthenticatedUserId();

            if (userId) {
                await PetLocalRepository.replaceAll(userId, pets);
            }

            return pets;
        } catch (error) {
            console.log('Erro ao carregar pets pela API:', error);

            const userId = await this.getAuthenticatedUserId();

            if (!userId) {
                throw error;
            }

            return PetLocalRepository.findAll(userId);
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

    private static toPetCache(pet: ApiPetResponse): Pet {
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

    private static async getAuthenticatedUserId() {
        const { data } = await supabase.auth.getSession();

        return data.session?.user.id ?? null;
    }
}
