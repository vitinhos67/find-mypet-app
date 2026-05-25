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

    static async carregarImagemPerfil(): Promise<string | null> {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
            console.log('Erro ao buscar usuário para imagem:', error.message);
            return null;
        }

        const user = data.user;

        if (!user) {
            return null;
        }

        const imagemSalva = await AsyncStorage.getItem(
            `@profile_image_${user.id}`
        );

        return imagemSalva;
    }

    static async salvarImagemPerfil(imagemUri: string): Promise<void> {
        const { data, error } = await supabase.auth.getUser();
    
        if (error) {
            console.log('Erro ao buscar usuário para salvar imagem:', error.message);
            return;
        }
    
        const user = data.user;
    
        if (!user) {
            return;
        }
    
        await AsyncStorage.setItem(
            `@profile_image_${user.id}`,
            imagemUri
        );
    }

    static async realizarLogout(): Promise<void> {
        const { data } = await supabase.auth.getUser();
        
        if (data.user) {
            await AsyncStorage.removeItem(`@usuario_${data.user.id}`);
        }
    
        await AsyncStorage.removeItem('@usuario');
        await AsyncStorage.removeItem('@profile_image');
        await AsyncStorage.removeItem('@manter_conectado');
    
        const { error } = await supabase.auth.signOut();
    
        if (error) {
            console.log('Erro ao sair da conta:', error.message);
        }
    }
}