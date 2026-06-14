import { useCallback, useEffect, useState } from 'react';
import { PetLocation } from '../src/models/location.model';
import { LocationService } from '../src/services/LocationService';

export function useLocationViewModel(petId: string) {
    const [localizacao, setLocalizacao] = useState<PetLocation | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const buscarLocalizacao = useCallback(async () => {
        setIsLoading(true);
        try {
            const resultado = await LocationService.getLastLocation(petId);
            setLocalizacao(resultado);
        } finally {
            setIsLoading(false);
        }
    }, [petId]);

    useEffect(() => {
        buscarLocalizacao();
    }, [buscarLocalizacao]);

    return { localizacao, isLoading, buscarLocalizacao };
}
