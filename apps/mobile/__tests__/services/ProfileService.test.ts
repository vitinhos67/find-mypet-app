import { ProfileService } from '../../services/ProfileService';
import { ApiService } from '../../services/ApiService';
import { ProfileLocalRepository } from '../../src/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../src/shared/lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
}));

jest.mock('../../services/ApiService', () => ({
    ApiService: {
        get: jest.fn(),
        patch: jest.fn(),
    },
}));

jest.mock('../../src/database', () => ({
    ProfileLocalRepository: {
        upsert: jest.fn(),
        findByUserId: jest.fn(),
    },
}));

jest.mock('../../src/shared/lib/supabase', () => ({
    supabase: {
        auth: {
            getUser: jest.fn(),
            getSession: jest.fn(),
            signOut: jest.fn(),
        },
        storage: {
            from: jest.fn(() => ({
                upload: jest.fn(),
                getPublicUrl: jest.fn(),
                createSignedUrl: jest.fn(),
            })),
        },
    },
}));

jest.mock('expo-file-system/legacy', () => ({
    readAsStringAsync: jest.fn(),
    EncodingType: { Base64: 'base64' },
}));

jest.mock('base64-arraybuffer', () => ({
    decode: jest.fn(() => 'binary-data'),
}));

describe('ProfileService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    it('deve carregar usuário da API e salvar no cache', async () => {
        (ApiService.get as jest.Mock).mockResolvedValue({
            data: {
                id: '123',
                email: 'test@email.com',
                profile: {
                    full_name: 'Heron',
                    email: 'test@email.com',
                    phone: '11999999999',
                    gender: 'Masculino',
                    avatar_url: null,
                },
                metadata: {
                    name: 'Heron Meta',
                },
            },
        });

        const result = await ProfileService.carregarUsuarioAtual();

        expect(result?.nome).toBe('Heron');
        expect(AsyncStorage.setItem).toHaveBeenCalled();
        expect(ProfileLocalRepository.upsert).toHaveBeenCalled();
    });
    it('deve usar fallback local quando API falhar', async () => {
    (ApiService.get as jest.Mock).mockRejectedValue(new Error('API down'));

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: {
            session: {
                user: {
                    id: '1',
                    email: 'local@email.com',
                    user_metadata: {
                        name: 'Local User',
                    },
                },
            },
        },
    });

    (ProfileLocalRepository.findByUserId as jest.Mock).mockResolvedValue({
        nome: 'Local User',
        email: 'local@email.com',
    });

    const result = await ProfileService.carregarUsuarioAtual();

    expect(result?.nome).toBe('Local User');
});
it('deve atualizar perfil via API e salvar localmente', async () => {
    (ApiService.patch as jest.Mock).mockResolvedValue({
        data: {
            id: '1',
            full_name: 'Novo Nome',
            email: 'novo@email.com',
            phone: '11999999999',
            gender: 'Masculino',
            avatar_url: null,
        },
    });

    const result = await ProfileService.atualizarPerfil({
        nome: 'Novo Nome',
        telefone: '11999999999',
        genero: 'Masculino',
        avatarPath: null,
    });

    expect(result.nome).toBe('Novo Nome');
    expect(ProfileLocalRepository.upsert).toHaveBeenCalled();
});
it('deve realizar logout e limpar storage', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: '1' } },
    });

    (supabase.auth.signOut as jest.Mock).mockResolvedValue({});

    await ProfileService.realizarLogout();

    expect(AsyncStorage.removeItem).toHaveBeenCalled();
    expect(supabase.auth.signOut).toHaveBeenCalled();
});
it('deve fazer upload da imagem e atualizar perfil', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: '1' } },
    });

    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('base64img');

    (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: jest.fn().mockResolvedValue({}),
        getPublicUrl: jest.fn(() => ({
            data: { publicUrl: 'http://image.com/avatar.png' },
        })),
        createSignedUrl: jest.fn(),
    });

    jest.spyOn(ProfileService, 'carregarUsuarioAtual').mockResolvedValue({
        nome: 'User',
        email: 'email@test.com',
        telefone: null,
        genero: null,
        avatarPath: null,
    } as any);

    jest.spyOn(ProfileService, 'atualizarPerfil').mockResolvedValue({
        nome: 'User',
    } as any);

    const result = await ProfileService.salvarImagemPerfil('file://img.png');

    expect(result).toBeDefined();
});})