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
}; 
