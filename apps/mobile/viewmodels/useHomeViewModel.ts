import { useEffect, useState } from 'react';
import { PetService } from '../services/PetService';

type PetType = {
    id: number;
    nome: string;
    ultimaLocalizacao: string;
};

export function useHomeViewModel() {

    const [pets, setPets] =
        useState<PetType[]>([]);

    const [isLoading, setIsLoading] =
        useState(false);

    useEffect(() => {
        carregarPets();
    }, []);

    async function carregarPets() {

        try {

            setIsLoading(true);

            const resposta =
                await PetService.listarPets();

            setPets(resposta);

        } catch (error) {

            console.log(error);

        } finally {

            setIsLoading(false);
        }
    }

    return {
        pets,
        isLoading,
    };
}