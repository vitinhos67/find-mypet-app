import { act, renderHook } from '@testing-library/react-native';

import { PetLocalRepository } from '../../database';
import { Pet } from '../../src/models/pet.model';
import { ApiService } from '../../services/ApiService';
import { AuthService } from '../../services/AuthService';
import { usePetViewModel } from '../../viewmodels/usePetViewModel';

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

jest.mock('../../services/ApiService', () => ({
  ApiService: {
    get: jest.fn(),
  },
}));

jest.mock('../../services/AuthService', () => ({
  AuthService: {
    getCurrentUserId: jest.fn(),
  },
}));

jest.mock('../../services/StorageService', () => ({
  StorageService: {
    uploadPetImage: jest.fn(),
  },
}));

jest.mock('../../database', () => ({
  PetLocalRepository: {
    findById: jest.fn(),
    findAll: jest.fn(),
    replaceAll: jest.fn(),
    upsert: jest.fn(),
  },
}));

describe('usePetViewModel pet detail fallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('loads cached pet detail when API fails', async () => {
    const cachedPet: Pet = {
      id: 'pet-1',
      foto: 'cached-pet.jpg',
      nome: 'Rex Cache',
      raca: 'Vira-lata',
      cor: 'Caramelo',
      sexo: 'MACHO',
      descricao: 'Pet salvo no cache local',
    };

    (ApiService.get as jest.Mock).mockRejectedValue(new Error('API down'));
    (AuthService.getCurrentUserId as jest.Mock).mockResolvedValue('user-1');
    (PetLocalRepository.findById as jest.Mock).mockResolvedValue(cachedPet);

    const { result } = await renderHook(() => usePetViewModel());

    let returnedPet: Pet | null = null;

    await act(async () => {
      returnedPet = await result.current.carregarPetPorId('pet-1');
    });

    expect(ApiService.get).toHaveBeenCalledWith('/pets/pet-1');
    expect(PetLocalRepository.findById).toHaveBeenCalledWith(
      'user-1',
      'pet-1'
    );
    expect(returnedPet).toEqual(cachedPet);
    expect(result.current.getPetById('pet-1')).toEqual(cachedPet);
  });
});
