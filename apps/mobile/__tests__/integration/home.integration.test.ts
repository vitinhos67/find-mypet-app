import { act, renderHook, waitFor } from '@testing-library/react-native';

import { DeviceLocalRepository } from '../../src/database';
import { supabase } from '../../src/shared/lib/supabase';
import { ApiService } from '../../src/services/ApiService';
import { useHomeViewModel } from '../../viewmodels/useHomeViewModel';

jest.mock('react-native-maps', () => 'MapView');

jest.mock('../../src/shared/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock('../../src/database', () => ({
  DeviceLocalRepository: {
    replaceAll: jest.fn(),
    findAll: jest.fn(),
  },
}));

function mockSupabaseAuth() {
  (supabase.auth.getSession as jest.Mock).mockResolvedValue({
    data: {
      session: {
        access_token: 'access-token',
        user: {
          id: 'user-1',
          email: 'user@test.com',
        },
      },
    },
  });
}

describe('Fluxo da home', () => {
  let apiGetSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    apiGetSpy = jest.spyOn(ApiService, 'get');
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockSupabaseAuth();
  });

  it('deve compor pets e dispositivos usando os campos normalizados do dispositivo', async () => {
    apiGetSpy.mockImplementation(async (endpoint: string) => {
      if (endpoint === '/pets') {
        return [
          {
            id: 'pet-1',
            nome: 'Rex Home',
            foto: 'rex-home.jpg',
            raca: '',
            cor: '',
            sexo: 'MACHO',
            descricao: '',
          },
        ];
      }

      if (endpoint === '/devices') {
        return [
          {
            id: 'device-1',
            name: 'Coleira Home',
            serial_number: 'SN123',
            pet_id: 'pet-1',
            status: 'ONLINE',
            battery_level: 77,
          },
        ];
      }

      if (endpoint === '/pets/pet-1/location') {
        return {
          data: {
            petId: 'pet-1',
            latitude: -21.1,
            longitude: -42.3,
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        };
      }

      if (endpoint === '/pets/pet-1/safe-zone') {
        return null;
      }

      if (endpoint === '/alerts') {
        return [];
      }

      return null;
    });

    const { result } = await renderHook(() => useHomeViewModel());

    await act(async () => {
      await result.current.carregarPets();
    });

    await waitFor(() => {
      expect(result.current.pets).toHaveLength(1);
    });

    expect(result.current.pets[0]).toEqual(
      expect.objectContaining({
        id: 'pet-1',
        nome: 'Rex Home',
        nomeColeira: 'Coleira Home',
        deviceId: 'device-1',
        status: 'ONLINE',
        batteryLevel: 77,
        latitude: -21.1,
        longitude: -42.3,
      })
    );
    expect(result.current.selectedPetId).toBe('pet-1');
    expect(DeviceLocalRepository.replaceAll).toHaveBeenCalledWith(
      'user-1',
      [expect.objectContaining({ id: 'device-1', nome: 'Coleira Home' })]
    );
  });
});
