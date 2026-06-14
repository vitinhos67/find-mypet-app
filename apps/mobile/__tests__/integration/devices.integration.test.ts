import { renderHook, waitFor } from '@testing-library/react-native';

import { DeviceLocalRepository } from '../../src/database';
import { CollarDevice } from '../../src/models/device.model';
import { supabase } from '../../src/shared/lib/supabase';
import { ApiService } from '../../src/services/ApiService';
import { useDeviceViewModel } from '../../viewmodels/useDeviceViewModel';

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

const cachedDevice: CollarDevice = {
  id: 'device-1',
  nome: 'Coleira Cache',
  serialNumber: 'SN123',
  wifiSsid: 'Casa',
  wifiSenha: 'senha',
  intervaloAcordarMinutos: 15,
  comportamentoSemWifi: 'STORE',
  petId: 'pet-1',
  status: 'OFFLINE',
  batteryLevel: 42,
};

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

describe('Fluxo de dispositivos', () => {
  let apiGetSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    apiGetSpy = jest.spyOn(ApiService, 'get');
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockSupabaseAuth();
  });

  it('deve carregar dispositivos da API e salvar no cache local', async () => {
    apiGetSpy.mockResolvedValue([
      {
        id: 'device-1',
        name: 'Coleira API',
        serial_number: 'SN123',
        wifi_ssid: 'Casa',
        wifi_password: 'senha',
        wake_interval: 15,
        behavior_no_wifi: 'STORE',
        pet_id: 'pet-1',
        status: 'ONLINE',
        battery_level: 88,
      },
    ]);

    const { result } = await renderHook(() => useDeviceViewModel());

    await waitFor(() => {
      expect(result.current.devices).toHaveLength(1);
    });

    expect(result.current.devices[0]).toEqual(
      expect.objectContaining({
        id: 'device-1',
        nome: 'Coleira API',
        petId: 'pet-1',
        batteryLevel: 88,
      })
    );
    expect(DeviceLocalRepository.replaceAll).toHaveBeenCalledWith(
      'user-1',
      [expect.objectContaining({ id: 'device-1', nome: 'Coleira API' })]
    );
  });

  it('deve usar fallback do cache local quando a API falhar', async () => {
    apiGetSpy.mockRejectedValue(new Error('API down'));
    (DeviceLocalRepository.findAll as jest.Mock).mockResolvedValue([cachedDevice]);

    const { result } = await renderHook(() => useDeviceViewModel());

    await waitFor(() => {
      expect(result.current.devices).toEqual([cachedDevice]);
    });

    expect(DeviceLocalRepository.findAll).toHaveBeenCalledWith('user-1');
  });
});
