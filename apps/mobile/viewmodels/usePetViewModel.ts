import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { PetLocalRepository } from '../src/database';
import { Pet, PetPayload, SexoPet, SharedPetResponse } from '../src/models/pet.model';
import { AuthService } from '../src/services/AuthService';
import { PetService } from '../src/services/PetService';
import { ShareService } from '../src/services/ShareService';
import { StorageService } from '../src/services/StorageService';

function mapDbToPet(dbPet: any): Pet {
    return {
        id: dbPet.id,
        foto: dbPet.image_href || dbPet.foto,
        nome: dbPet.name || dbPet.nome,
        raca: dbPet.raca,
        cor: dbPet.cor,
        sexo: dbPet.sexo as SexoPet,
        descricao: dbPet.descricao,
        isShared: false
    };
}

function mapSharedToPet(shared: SharedPetResponse): Pet {
    return {
        id: shared.id,
        foto: shared.image_href ?? undefined,
        nome: shared.name,
        raca: shared.raca ?? '',
        cor: shared.cor ?? '',
        sexo: (shared.sexo ?? 'MACHO') as SexoPet,
        descricao: shared.descricao ?? '',
        isShared: true,
        sharePermission: shared.permission,
        shareId: shared.share_id,
        ownerName: shared.owner_name ?? undefined,
    };
}

export function usePetViewModel() {
    const [pets, setPets] = useState<Pet[]>([]);
    const [sharedPets, setSharedPets] = useState<Pet[]>([]);
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const carregarPets = useCallback(async () => {
        setIsLoading(true);
        try {
            const [petsResposta, sharedResposta] = await Promise.all([
                PetService.getPets(),
                ShareService.getSharedWithMe().catch(() => [])
            ]);

            const petsData = Array.isArray(petsResposta) ? petsResposta : ((petsResposta as any)?.data || []);
            const sharedData = Array.isArray(sharedResposta) ? sharedResposta : ((sharedResposta as any)?.data || []);

            const mappedPets = petsData.map(mapDbToPet);
            const mappedShared = sharedData.map(mapSharedToPet);

            setPets(mappedPets);
            setSharedPets(mappedShared);

            const userId = await AuthService.getCurrentUserId();
            if (userId) {
                await PetLocalRepository.replaceAll(userId, mappedPets);
            }
        } catch (error) {
            console.error('Erro ao carregar pets:', error);
            const userId = await AuthService.getCurrentUserId();
            if (userId) {
                const cached = await PetLocalRepository.findAll(userId);
                setPets(cached);
            } else {
                Alert.alert('Erro', 'Não foi possível carregar os pets da nuvem.');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const carregarPetPorId = useCallback(async (id: string) => {
        setIsLoading(true);
        try {
            const inMemory = pets.find(p => p.id === id) ?? sharedPets.find(p => p.id === id);
            if (inMemory) {
                setSelectedPet(inMemory);
                return inMemory;
            }

            const pet = await PetService.getPetById(id);
            if (pet) {
                setSelectedPet(pet);
                return pet;
            }

            setSelectedPet(null);
            return null;

        } catch (error) {
            console.error('Erro ao carregar detalhe do pet:', error);
            setSelectedPet(null);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [pets, sharedPets]);

    async function adicionarPet(
        foto: string,
        nome: string,
        raca: string,
        cor: string,
        sexo: SexoPet,
        descricao: string
    ) {
        if (!nome.trim()) {
            Alert.alert('Erro', 'O nome do pet é obrigatório.');
            return false;
        }
        setIsLoading(true);
        try {
            let fotoUrl = foto;
            if (foto && foto.startsWith('file://')) {
                const urlNaNuvem = await StorageService.uploadPetImage(foto);
                fotoUrl = urlNaNuvem || '';
            }

            const payload: PetPayload = { foto: fotoUrl, nome, raca, cor, sexo, descricao };
            await PetService.createPet(payload);
            await carregarPets();
            Alert.alert('Sucesso', 'Pet cadastrado com sucesso!');
            return true;
        } catch (error) {
            console.error('Erro ao cadastrar pet:', error);
            Alert.alert('Erro', 'Falha ao salvar o pet no servidor.');
            return false;
        } finally {
            setIsLoading(false);
        }
    }

    async function atualizarPet(
        id: string,
        foto: string,
        nome: string,
        raca: string,
        cor: string,
        sexo: SexoPet,
        descricao: string
    ) {
        setIsLoading(true);
        try {
            let fotoUrl = foto;
            if (foto && foto.startsWith('file://')) {
                const urlNaNuvem = await StorageService.uploadPetImage(foto);
                fotoUrl = urlNaNuvem || '';
            }

            const payload: PetPayload = { foto: fotoUrl, nome, raca, cor, sexo, descricao };
            await PetService.updatePet(id, payload);
            await carregarPets();
            Alert.alert('Sucesso', 'Pet atualizado com sucesso!');
            return true;
        } catch (error) {
            console.error('Erro ao atualizar pet:', error);
            Alert.alert('Erro', 'Falha ao atualizar o pet no servidor.');
            return false;
        } finally {
            setIsLoading(false);
        }
    }

    async function excluirPet(id: string) {
        setIsLoading(true);
        try {
            await PetService.deletePet(id);
            await carregarPets();
            Alert.alert('Sucesso', 'Pet removido com sucesso!');
            return true;
        } catch (error) {
            console.error('Erro ao excluir pet:', error);
            Alert.alert('Erro', 'Não foi possível excluir o pet.');
            return false;
        } finally {
            setIsLoading(false);
        }
    }

    function getPetById(id: string) {
        return pets.find(pet => pet.id === id)
            ?? sharedPets.find(pet => pet.id === id)
            ?? (selectedPet?.id === id ? selectedPet : undefined);
    }

    async function selecionarFoto(): Promise<string | null> {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permissão necessária',
                'Precisamos de acesso às suas fotos para selecionar uma imagem do pet.'
            );
        return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
        aspect: [1, 1]
    });

    if (!result.canceled) {
        return result.assets[0].uri;
    }

    return null;
    }

    return {
        pets,
        sharedPets,
        isLoading,
        carregarPets,
        carregarPetPorId,
        adicionarPet,
        atualizarPet,
        excluirPet,
        getPetById,
        selecionarFoto
    };
}
