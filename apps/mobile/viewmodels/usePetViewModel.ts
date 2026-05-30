import { Alert } from 'react-native';
import { useCallback, useState } from 'react';

export interface Pet {
    id: string;
    foto?: string;
    nome: string;
    raca: string;
    cor: string;
    sexo: 'MACHO' | 'FEMEA';
    descricao: string;
}

let fakeDatabase: Pet[] = [];

export function usePetViewModel() {
    const [pets, setPets] = useState<Pet[]>([]);

    const carregarPets = useCallback(() => {
        setPets([...fakeDatabase]);
    }, []);

    async function adicionarPet(
        foto: string,
        nome: string,
        raca: string,
        cor: string,
        sexo: 'MACHO' | 'FEMEA',
        descricao: string
    ) {
        if (!nome.trim()) {
            Alert.alert('Erro', 'O nome do pet é obrigatório.');
            return false;
        }

        const novoPet: Pet = {
            id: Math.random().toString(36).substring(7),
            foto,
            nome,
            raca,
            cor,
            sexo,
            descricao
        };

        fakeDatabase.push(novoPet);

        carregarPets();

        Alert.alert(
            'Sucesso',
            'Pet cadastrado com sucesso!'
        );

        return true;
    }

    async function atualizarPet(
        id: string,
        foto: string,
        nome: string,
        raca: string,
        cor: string,
        sexo: 'MACHO' | 'FEMEA',
        descricao: string
    ) {
        fakeDatabase = fakeDatabase.map(pet =>
            pet.id === id
                ? {
                      ...pet,
                      foto,
                      nome,
                      raca,
                      cor,
                      sexo,
                      descricao
                  }
                : pet
        );

        carregarPets();

        Alert.alert(
            'Sucesso',
            'Pet atualizado com sucesso!'
        );

        return true;
    }

    async function excluirPet(id: string) {
        fakeDatabase = fakeDatabase.filter(
            pet => pet.id !== id
        );

        carregarPets();

        Alert.alert(
            'Sucesso',
            'Pet removido com sucesso!'
        );

        return true;
    }

    function getPetById(id: string) {
        return fakeDatabase.find(
            pet => pet.id === id
        );
    }

    return {
        pets,
        carregarPets,
        adicionarPet,
        atualizarPet,
        excluirPet,
        getPetById
    };
}