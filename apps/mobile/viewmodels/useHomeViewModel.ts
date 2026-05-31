import { useCallback, useEffect, useState } from 'react';
import { PetService } from '../services/PetService';

type PetHomeType = {
    id: string;
    nome: string;
    ultimaLocalizacao: string;
    foto?: string;
};
export function useHomeViewModel() {
    const [pets, setPets] = useState<PetHomeType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        carregarPets();
    }, []);

    const carregarPets = useCallback(async () => {
        try {
            setIsLoading(true);
            const resposta: any = await PetService.getPets();
            const petsData = Array.isArray(resposta) ? resposta : (resposta?.data || []);
            const petsFormatados = petsData.map((pet: any) => ({
                id: pet.id,
                nome: pet.name || pet.nome,
                foto: pet.image_href || pet.foto,
                ultimaLocalizacao: 'Localização Desconhecida'
            }));
            setPets(petsFormatados);
        } catch (error) {
            console.error('Erro na Home:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarPets();
    }, [carregarPets]);
    return {
        pets,
        isLoading,
        carregarPets
    };
}