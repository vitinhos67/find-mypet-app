export type SexoPet = 'MACHO' | 'FEMEA';
export type SharePermission = 'VIEW' | 'EDIT';

export interface Pet {
    id: string;
    foto?: string;
    nome: string;
    raca: string;
    cor: string;
    sexo: SexoPet;
    descricao: string;
    isShared?: boolean;
    sharePermission?: SharePermission;
    shareId?: string;
    ownerEmail?: string;
    ownerName?: string;
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

export interface PetShare {
    id: string;
    pet_id: string;
    owner_id: string;
    shared_with_user_id: string;
    shared_with_email?: string;
    permission: SharePermission;
    created_at: string;
}

export interface SharedPetResponse {
    share_id: string;
    permission: SharePermission;
    id: string;
    image_href: string | null;
    name: string;
    raca: string | null;
    cor: string | null;
    sexo: SexoPet | null;
    descricao: string | null;
    owner_id: string;
    owner_name: string | null;
    created_at: string;
}