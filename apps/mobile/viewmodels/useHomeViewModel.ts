import { useCallback, useEffect, useState } from 'react';
import { DeviceService } from '../services/DeviceService';
import { PetService } from '../services/PetService';

type PetHomeType = {
    id: string;
    nome: string;
    ultimaLocalizacao: string;
    foto?: string;
    nomeColeira?: string | null; 
}
export function useHomeViewModel() {
    const [pets, setPets] = useState<PetHomeType[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const carregarPets = useCallback(async () => {
        try {
            setIsLoading(true);
            const [petsResponse, devicesResponse]: [any, any] = await Promise.all([
                PetService.getPets(),
                DeviceService.getDevices()
            ]);

            const petsData = Array.isArray(petsResponse) ? petsResponse : (petsResponse?.data || []);
            const devicesData = Array.isArray(devicesResponse) ? devicesResponse : (devicesResponse?.data || []);

            const petsFormatados = petsData.map((pet: any) => {
                const coleiraVinculada = devicesData.find((d: any) => d.pet_id === pet.id);

                return {
                    id: pet.id,
                    nome: pet.name || pet.nome,
                    foto: pet.image_href || pet.foto,
                    ultimaLocalizacao: 'Localização Desconhecida',
                    nomeColeira: coleiraVinculada ? coleiraVinculada.name : null
                };
            });
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