import { renderHook, waitFor } from '@testing-library/react-native';

import { ProfileLocalRepository } from '../../src/database';
import { UserProfile } from '../../src/models/profile.model';
import { supabase } from '../../src/shared/lib/supabase';
import { ApiService } from '../../src/services/ApiService';
import { useProfileViewModel } from '../../viewmodels/useProfileViewModel';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('expo-file-system/legacy', () => ({
  readAsStringAsync: jest.fn(),
  EncodingType: { Base64: 'base64' },
}));

jest.mock('base64-arraybuffer', () => ({
  decode: jest.fn(() => 'binary-data'),
}));

jest.mock('../../src/shared/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      signOut: jest.fn(),
    },
    storage: {
      from: jest.fn(),
    },
  },
}));

jest.mock('../../src/database', () => ({
  ProfileLocalRepository: {
    upsert: jest.fn(),
    findByUserId: jest.fn(),
  },
}));

const authUser = {
  id: 'user-1',
  email: 'user@test.com',
  user_metadata: {
    name: 'Usuario Teste',
    telefone: '11999999999',
    genero: 'Masculino',
  },
};

const cachedProfile: UserProfile = {
  nome: 'Perfil Cache',
  email: 'cache@test.com',
  telefone: '11999999999',
  genero: 'Masculino',
  avatarPath: 'user-1/avatar.jpg',
};

function mockSupabaseAuth() {
  (supabase.auth.getSession as jest.Mock).mockResolvedValue({
    data: {
      session: {
        access_token: 'access-token',
        user: authUser,
      },
    },
  });
  (supabase.auth.getUser as jest.Mock).mockResolvedValue({
    data: { user: authUser },
    error: null,
  });
}

function mockSupabaseStorage(publicUrl = 'https://cdn.test/avatar.jpg') {
  (supabase.storage.from as jest.Mock).mockReturnValue({
    upload: jest.fn().mockResolvedValue({ error: null }),
    getPublicUrl: jest.fn(() => ({
      data: { publicUrl },
    })),
    createSignedUrl: jest.fn(),
  });
}

describe('Fluxo de perfil', () => {
  let apiGetSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    apiGetSpy = jest.spyOn(ApiService, 'get');
    jest.spyOn(console, 'log').mockImplementation(() => {});
    mockSupabaseAuth();
    mockSupabaseStorage();
  });

  it('deve carregar o perfil da API, salvar no cache e resolver a URL do avatar', async () => {
    apiGetSpy.mockResolvedValue({
      data: {
        id: 'user-1',
        email: 'api@test.com',
        metadata: { name: 'Nome Metadata' },
        profile: {
          id: 'user-1',
          full_name: 'Nome API',
          email: 'api@test.com',
          phone: '11999999999',
          gender: 'Feminino',
          avatar_url: 'user-1/avatar.jpg',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
      },
    });
    (ProfileLocalRepository.findByUserId as jest.Mock).mockResolvedValue({
      ...cachedProfile,
      nome: 'Nome API',
      avatarPath: 'user-1/avatar.jpg',
    });

    const { result } = await renderHook(() => useProfileViewModel());

    await waitFor(() => {
      expect(result.current.usuario.nome).toBe('Nome API');
    });

    expect(ProfileLocalRepository.upsert).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        nome: 'Nome API',
        email: 'api@test.com',
        avatarPath: 'user-1/avatar.jpg',
      })
    );
    expect(result.current.profileImage).toBe('https://cdn.test/avatar.jpg');
  });

  it('deve usar fallback do cache local quando a API falhar', async () => {
    apiGetSpy.mockRejectedValue(new Error('API down'));
    (ProfileLocalRepository.findByUserId as jest.Mock).mockResolvedValue(cachedProfile);

    const { result } = await renderHook(() => useProfileViewModel());

    await waitFor(() => {
      expect(result.current.usuario.nome).toBe('Perfil Cache');
    });

    expect(ProfileLocalRepository.findByUserId).toHaveBeenCalledWith('user-1');
    expect(result.current.telefone).toBe('11999999999');
  });
});
