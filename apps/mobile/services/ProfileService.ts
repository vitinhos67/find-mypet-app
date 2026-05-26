import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '../src/shared/lib/supabase';
import { ApiService } from './ApiService';

export type UserProfile = {
    nome: string;
    email: string;
};

type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
};

type MeResponse = {
    id: string;
    email?: string;
    metadata?: {
        nome_completo?: string;
        name?: string;
        [key: string]: unknown;
    };
};

export class ProfileService {

    static async carregarUsuarioAtual(): Promise<UserProfile | null> {
        const response =
        await ApiService.get<ApiResponse<MeResponse>>('/me');

        const user = response.data;

        if (!user) {
            return null;
        }

        const usuarioAtual = {
            nome:
                user.metadata?.nome_completo ||
                user.metadata?.name ||
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