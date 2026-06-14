import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';

import { ProfileLocalRepository } from '../src/database';
import { UpdateProfileInput, UserProfile } from '../src/models/profile.model';
import { supabase } from '../src/shared/lib/supabase';
import { ApiService } from './ApiService';

const AVATARS_BUCKET = 'avatars';

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
                avatarPath: this.extractAvatarFilePath(user.profile?.avatar_url ?? null),
            };

            await AsyncStorage.setItem(
                `@usuario_${user.id}`,
                JSON.stringify(usuarioAtual)
            );

            await ProfileLocalRepository.upsert(user.id, usuarioAtual);

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

        const usuarioCache = await ProfileLocalRepository.findByUserId(user.id);

        if (usuarioCache) {
            return usuarioCache;
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
            avatarPath: null,
        };

        await AsyncStorage.setItem(
            `@usuario_${user.id}`,
            JSON.stringify(usuarioAtual)
        );

        await ProfileLocalRepository.upsert(user.id, usuarioAtual, null);

        return usuarioAtual;
    }

    static async atualizarPerfil(
        input: UpdateProfileInput
    ): Promise<UserProfile> {
        const gender = this.normalizeGender(input.genero);
        const phone = this.normalizePhone(input.telefone);

        const response =
            await ApiService.patch<ApiResponse<ProfileResponse>>(
                '/me/profile',
                {
                    full_name: input.nome,
                    phone,
                    gender,
                    avatar_url: input.avatarPath || null,
                }
            );

        const profile = response.data;

        const usuarioAtual = {
            nome: profile.full_name || 'Usuário',
            email: profile.email || 'email@email.com',
            telefone: profile.phone,
            genero: profile.gender,
            avatarPath: this.extractAvatarFilePath(profile.avatar_url),
        };

        await AsyncStorage.setItem(
            `@usuario_${profile.id}`,
            JSON.stringify(usuarioAtual)
        );

        await ProfileLocalRepository.upsert(profile.id, usuarioAtual);

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

        const usuarioCache = await ProfileLocalRepository.findByUserId(user.id);

        const usuario = usuarioCache ?? await this.carregarUsuarioLocal();

        return this.getAvatarDisplayUrl(usuario?.avatarPath);
    }

    static async salvarImagemPerfil(
        imagemUri: string,
        mimeType?: string | null
    ): Promise<UserProfile | null> {
        const { data, error } = await supabase.auth.getUser();
    
        if (error) {
            throw new Error(error.message);
        }
    
        const user = data.user;
    
        if (!user) {
            throw new Error('Usuário não autenticado.');
        }

        const { extension, contentType } = this.getImageMetadata(
            imagemUri,
            mimeType || undefined
        );
        const filePath = `${user.id}/avatar-${Date.now()}.${extension}`;
        const base64Image = await FileSystem.readAsStringAsync(imagemUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const { error: uploadError } = await supabase.storage
            .from(AVATARS_BUCKET)
            .upload(filePath, decode(base64Image), {
                contentType,
                upsert: false,
            });

        if (uploadError) {
            throw new Error(uploadError.message);
        }

        const usuarioAtual = await this.carregarUsuarioAtual();

        if (!usuarioAtual) {
            throw new Error('Não foi possível carregar o perfil atual.');
        }
    
        return this.atualizarPerfil({
            nome: usuarioAtual.nome,
            telefone: usuarioAtual.telefone,
            genero: usuarioAtual.genero,
            avatarPath: filePath,
        });
    }

    private static normalizePhone(phone?: string | null) {
        if (!phone) {
            return null;
        }

        const digits = phone.replace(/\D/g, '');

        return digits.length === 11 ? digits : null;
    }

    private static normalizeGender(gender?: string | null) {
        if (
            gender === 'Masculino' ||
            gender === 'Feminino' ||
            gender === 'Outro'
        ) {
            return gender;
        }

        return null;
    }

    private static getImageMetadata(uri: string, mimeType?: string) {
        const normalizedMimeType = mimeType || '';

        if (normalizedMimeType.includes('png') || uri.endsWith('.png')) {
            return {
                extension: 'png',
                contentType: 'image/png',
            };
        }

        if (normalizedMimeType.includes('webp') || uri.endsWith('.webp')) {
            return {
                extension: 'webp',
                contentType: 'image/webp',
            };
        }

        return {
            extension: 'jpg',
            contentType: 'image/jpeg',
        };
    }

    private static async getAvatarDisplayUrl(
        avatarPath?: string | null
    ): Promise<string | null> {
        if (!avatarPath) {
            return null;
        }

        const filePath = this.extractAvatarFilePath(avatarPath);

        if (!filePath) {
            return null;
        }

        const { data: publicUrlData } = supabase.storage
            .from(AVATARS_BUCKET)
            .getPublicUrl(filePath);

        if (publicUrlData.publicUrl) {
            return publicUrlData.publicUrl;
        }

        const { data, error } = await supabase.storage
            .from(AVATARS_BUCKET)
            .createSignedUrl(filePath, 60 * 60);

        if (error) {
            console.log('Erro ao criar URL de exibição do avatar:', error.message);
            return null;
        }

        return data.signedUrl;
    }

    private static extractAvatarFilePath(avatarUrl?: string | null): string | null {
        if (!avatarUrl) {
            return null;
        }

        if (!avatarUrl.startsWith('http')) {
            return avatarUrl;
        }

        const marker = `/object/public/${AVATARS_BUCKET}/`;
        const markerIndex = avatarUrl.indexOf(marker);

        if (markerIndex !== -1) {
            const pathWithQuery = avatarUrl.slice(markerIndex + marker.length);
            const [path] = pathWithQuery.split('?');

            return decodeURIComponent(path);
        }

        const signedMarker = `/object/sign/${AVATARS_BUCKET}/`;
        const signedMarkerIndex = avatarUrl.indexOf(signedMarker);

        if (signedMarkerIndex !== -1) {
            const pathWithQuery = avatarUrl.slice(
                signedMarkerIndex + signedMarker.length
            );
            const [path] = pathWithQuery.split('?');

            return decodeURIComponent(path);
        }

        return null;
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
