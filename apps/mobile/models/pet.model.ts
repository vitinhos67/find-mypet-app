export type SexoPet = 'MACHO' | 'FEMEA';

export interface Pet {
    id: string;
    foto?: string;
    nome: string;
    raca: string;
    cor: string;
    sexo: SexoPet;
    descricao: string;
}

export interface PetPayload {
    foto?: string;
    nome: string;
    raca: string;
    cor: string;
    sexo: SexoPet;
    descricao: string;
}

export interface PetResponse {
    id: string;
    foto?: string;
    nome: string;
    raca: string;
    cor: string;
    sexo: SexoPet;
    descricao: string;
    owner_id?: string;
    created_at?: string;
}
//