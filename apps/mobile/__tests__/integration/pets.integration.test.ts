import { act, renderHook } from '@testing-library/react-native';

import { PetLocalRepository } from '../../database';
import { Pet } from '../../models/pet.model';
import { supabase } from '../../src/shared/lib/supabase';
import { ApiService } from '../../services/ApiService';
import { usePetViewModel } from '../../viewmodels/usePetViewModel';

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

jest.mock('../../services/StorageService', () => ({
  StorageService: {
    uploadPetImage: jest.fn(),
  },
}));

jest.mock('../../src/shared/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock('../../database', () => ({
  PetLocalRepository: {
    replaceAll: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    upsert: jest.fn(),
  },
}));

const authUser = {
  id: 'user-1',
  email: 'user@test.com',
  user_metadata: {
    name: 'Usuario Teste',
  },
};

const cachedPet: Pet = {
  id: 'pet-1',
  foto: 'pet.jpg',
  nome: 'Rex',
  raca: 'Vira-lata',
  cor: 'Caramelo',
  sexo: 'MACHO',
  descricao: 'Pet cache',
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
}

describe('Fluxo de pets', () => {
  let apiGetSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    apiGetSpy = jest.spyOn(ApiService, 'get');
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockSupabaseAuth();
  });

  it('deve carregar pets da API, pets compartilhados e salvar no cache local', async () => {
    apiGetSpy.mockImplementation(async (endpoint: string) => {
      if (endpoint === '/pets') {
        return {
          success: true,
          data: [
            {
              id: 'pet-1',
              name: 'Rex API',
              image_href: 'rex.jpg',
              raca: 'SRD',
              cor: 'Caramelo',
              sexo: 'MACHO',
              descricao: 'Da API',
            },
          ],
        };
      }

      if (endpoint === '/shares') {
        return [
          {
            share_id: 'share-1',
            permission: 'VIEW',
            id: 'pet-shared',
            image_href: null,
            name: 'Luna Compartilhada',
            raca: null,
            cor: null,
            sexo: 'FEMEA',
            descricao: null,
            owner_id: 'owner-1',
            owner_name: 'Tutor',
            created_at: '2026-01-01T00:00:00.000Z',
          },
        ];
      }

      return null;
    });

    const { result } = await renderHook(() => usePetViewModel());

    await act(async () => {
      await result.current.carregarPets();
    });

    expect(result.current.pets).toEqual([
      expect.objectContaining({ id: 'pet-1', nome: 'Rex API' }),
    ]);
    expect(result.current.sharedPets).toEqual([
      expect.objectContaining({ id: 'pet-shared', nome: 'Luna Compartilhada' }),
    ]);
    expect(PetLocalRepository.replaceAll).toHaveBeenCalledWith(
      'user-1',
      [expect.objectContaining({ id: 'pet-1', nome: 'Rex API' })]
    );
  });

  it('deve usar fallback do cache local quando a listagem da API falhar', async () => {
    apiGetSpy.mockImplementation(async (endpoint: string) => {
      if (endpoint === '/pets') {
        throw new Error('API down');
      }
      return [];
    });
    (PetLocalRepository.findAll as jest.Mock).mockResolvedValue([cachedPet]);

    const { result } = await renderHook(() => usePetViewModel());

    await act(async () => {
      await result.current.carregarPets();
    });

    expect(PetLocalRepository.findAll).toHaveBeenCalledWith('user-1');
    expect(result.current.pets).toEqual([cachedPet]);
  });

  it('deve carregar detalhe do pet pela API e atualizar o cache local', async () => {
    apiGetSpy.mockResolvedValue({
      success: true,
      data: {
        id: 'pet-1',
        name: 'Rex Detalhe',
        image_href: 'detail.jpg',
        raca: 'SRD',
        cor: 'Preto',
        sexo: 'MACHO',
        descricao: 'Detalhe API',
      },
    });

    const { result } = await renderHook(() => usePetViewModel());

    let returnedPet: Pet | null = null;
    await act(async () => {
      returnedPet = await result.current.carregarPetPorId('pet-1');
    });

    expect(ApiService.get).toHaveBeenCalledWith('/pets/pet-1');
    expect(PetLocalRepository.upsert).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ id: 'pet-1', nome: 'Rex Detalhe' })
    );
    expect(returnedPet).toEqual(
      expect.objectContaining({ id: 'pet-1', nome: 'Rex Detalhe' })
    );
    expect(result.current.getPetById('pet-1')).toEqual(returnedPet);
  });
});
