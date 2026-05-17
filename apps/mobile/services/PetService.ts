type PetType = {
    id: number;
    nome: string;
    ultimaLocalizacao: string;
};

export class PetService {

    static async listarPets(): Promise<PetType[]> {

        // mock temporario, depois aqui virá Supabase/API

        return [
            {
                id: 1,
                nome: 'Rex',
                ultimaLocalizacao: 'Avenida Brasil',
            },
            {
                id: 2,
                nome: 'Mel',
                ultimaLocalizacao: 'Praça Central',
            },
        ];
    }
}