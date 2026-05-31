import AsyncStorage from '@react-native-async-storage/async-storage';

import { UpdateProfileInput, UserProfile } from '../models/profile.model';
import { supabase } from '../src/shared/lib/supabase';
import { ApiService } from './ApiService';

type ProfileResponse = {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    gender: string | null;
    avatar_url: string | null;
    updated_at: string | null;
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
    profile?: ProfileResponse | null;
};

export class ProfileService {

    static async carregarUsuarioAtual(): Promise<UserProfile | null> {
        try{
            const response =
            await ApiService.get<ApiResponse<MeResponse>>('/me');

            const user = response.data;

            if (!user) {
                return null;
            }

            const usuarioAtual = {
                nome:
                    user.profile?.full_name ||
                    user.metadata?.nome_completo ||
                    user.metadata?.name ||
                    'Usuário',
                email: user.profile?.email || user.email || 'email@email.com',
                telefone: user.profile?.phone ?? null,
                genero: user.profile?.gender ?? null,
                avatarUrl: user.profile?.avatar_url ?? null,
            };

            await AsyncStorage.setItem(
                `@usuario_${user.id}`,
                JSON.stringify(usuarioAtual)
            );

            return usuarioAtual;
        } catch (error) {
            console.log('Erro ao carregar usuário pela API:', error);

            return this.carregarUsuarioLocal();
        }
    }

    private static async carregarUsuarioLocal(): Promise<UserProfile | null> {
        const { data } = await supabase.auth.getSession();

        const user = data.session?.user;

        if (!user) {
            return null;
        }

        const usuarioSalvo = await AsyncStorage.getItem(
            `@usuario_${user.id}`
        );

        if (usuarioSalvo) {
            return JSON.parse(usuarioSalvo);
        }

        const usuarioAtual = {
            nome:
                user.user_metadata?.nome_completo ||
                user.user_metadata?.name ||
                'Usuário',
            email: user.email || 'email@email.com',
            telefone: user.user_metadata?.telefone ?? null,
            genero: user.user_metadata?.genero ?? null,
            avatarUrl: null,
        };

        await AsyncStorage.setItem(
            `@usuario_${user.id}`,
            JSON.stringify(usuarioAtual)
        );

        return usuarioAtual;
    }

    static async atualizarPerfil(
        input: UpdateProfileInput
    ): Promise<UserProfile> {
        const response =
            await ApiService.patch<ApiResponse<ProfileResponse>>(
                '/me/profile',
                {
                    full_name: input.nome,
                    phone: input.telefone || null,
                    gender: input.genero || null,
                    avatar_url: input.avatarUrl || null,
                }
            );

        const profile = response.data;

        const usuarioAtual = {
            nome: profile.full_name || 'Usuário',
            email: profile.email || 'email@email.com',
            telefone: profile.phone,
            genero: profile.gender,
            avatarUrl: profile.avatar_url,
        };

        await AsyncStorage.setItem(
            `@usuario_${profile.id}`,
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
