export type UserProfile = {
    nome: string;
    email: string;
    telefone?: string | null;
    genero?: string | null;
    avatarPath?: string | null;
};

export type UpdateProfileInput = {
    nome: string;
    telefone?: string | null;
    genero?: string | null;
    avatarPath?: string | null;
};
