import { supabase } from '../src/shared/lib/supabase';

export const AuthService = {

    async login(email: string, senha: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: senha,
        });
        if (error) {
            if (error.message.includes('Invalid login credentials')) {
                throw new Error("E-mail ou senha incorretos.");
            }
            throw new Error(error.message); 
        }
        return data;
    },
    async cadastrar(email: string, senha: string, nome: string, telefone: string, genero: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password: senha,
            options: {
                data: {
                    nome_completo: nome,
                    telefone: telefone,
                    genero: genero
                },
            },
        });

        if (error) {
            if (error.message.includes('User already registered')) {
                throw new Error("Este e-mail já está cadastrado no sistema.");
            }
            throw new Error(error.message);
        }
        return data;
    }
}; 
