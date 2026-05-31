import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { Pet, PetPayload, SexoPet } from '../models/pet.model';
import { PetService } from '../services/PetService';

function mapDbToPet(dbPet: any): Pet {
    return {
        id: dbPet.id,
        foto: dbPet.image_href || dbPet.foto,
        nome: dbPet.name || dbPet.nome,     
        raca: dbPet.raca,
        cor: dbPet.cor,
        sexo: dbPet.sexo as SexoPet,
        descricao: dbPet.descricao
    };
}

export function usePetViewModel() {
    const [pets, setPets] = useState<Pet[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const carregarPets = useCallback(async () => {
        setIsLoading(true);
        try {
            const resposta: any = await PetService.getPets();
            const petsData = Array.isArray(resposta) ? resposta : (resposta?.data || []);

            setPets(petsData.map(mapDbToPet));
        } catch (error) {
            console.error('Erro ao carregar pets:', error);
            Alert.alert('Erro', 'Não foi possível carregar os pets da nuvem.');
        } finally {
            setIsLoading(false);
        }
    }, []);

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
            const payload: PetPayload = { foto, nome, raca, cor, sexo, descricao };
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
            const payload: PetPayload = { foto, nome, raca, cor, sexo, descricao };
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
        return pets.find(pet => pet.id === id);
    }

    return {
        pets,
        isLoading,
        carregarPets,
        adicionarPet,
        atualizarPet,
        excluirPet,
        getPetById
    };
}