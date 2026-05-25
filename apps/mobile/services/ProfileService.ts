import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '../src/shared/lib/supabase';

export type UserProfile = {
    nome: string;
    email: string;
};

export class ProfileService {

    static async carregarUsuarioAtual(): Promise<UserProfile | null> {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
            console.log('Erro ao buscar usuário:', error.message);
            return null;
        }

        const user = data.user;

        if (!user) {
            return null;
        }

        const usuarioAtual = {
            nome:
                user.user_metadata?.nome_completo ||
                user.user_metadata?.name ||
                'Usuário',
            email: user.email || 'email@email.com',
        };

        await AsyncStorage.setItem(
            `@usuario_${user.id}`,
            JSON.stringify(usuarioAtual)
        );

        return usuarioAtual;
    }
}