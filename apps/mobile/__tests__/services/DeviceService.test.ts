import { DeviceService } from '../../services/DeviceService';
import { ApiService } from '../../services/ApiService';
import { DeviceLocalRepository } from '../../src/database';
import { AuthService } from '../../services/AuthService';

jest.mock('../../services/ApiService', () => ({
  ApiService: {
    get: jest.fn(),
    post: jest.fn(),
    request: jest.fn(),
  },
}));

jest.mock('../../src/database', () => ({
  DeviceLocalRepository: {
    replaceAll: jest.fn(),
    findAll: jest.fn(),
  },
}));

jest.mock('../../services/AuthService', () => ({
  AuthService: {
    getCurrentUserId: jest.fn(),
  },
}));

describe('DeviceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('getDevices', () => {
    it('deve retornar dispositivos da API', async () => {
      (ApiService.get as jest.Mock).mockResolvedValue([
        {
          id: '1',
          name: 'Coleira Teste',
          serial_number: 'ABC123',
          status: 'ONLINE',
        },
      ]);

      (AuthService.getCurrentUserId as jest.Mock)
        .mockResolvedValue('user-1');

      const result = await DeviceService.getDevices();

      expect(result).toHaveLength(1);

      expect(result[0]).toMatchObject({
        id: '1',
        nome: 'Coleira Teste',
        serialNumber: 'ABC123',
        status: 'ONLINE',
      });

      expect(DeviceLocalRepository.replaceAll)
        .toHaveBeenCalled();
    });

    it('deve buscar cache quando API falhar', async () => {
      (ApiService.get as jest.Mock)
        .mockRejectedValue(new Error('Erro API'));

      (AuthService.getCurrentUserId as jest.Mock)
        .mockResolvedValue('user-1');

      (DeviceLocalRepository.findAll as jest.Mock)
        .mockResolvedValue([
          {
            id: '1',
            nome: 'Cache Device',
          },
        ]);

      const result = await DeviceService.getDevices();

      expect(DeviceLocalRepository.findAll)
        .toHaveBeenCalledWith('user-1');

      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('deve chamar ApiService.post', async () => {
      const payload = {
        nome: 'Coleira Nova',
      };

      await DeviceService.create(payload);

      expect(ApiService.post)
        .toHaveBeenCalledWith(
          '/devices',
          payload
        );
    });
  });

  describe('update', () => {
    it('deve chamar request com PUT', async () => {
      const payload = {
        nome: 'Atualizado',
      };

      await DeviceService.update(
        '123',
        payload
      );

      expect(ApiService.request)
        .toHaveBeenCalledWith(
          '/devices/123',
          {
            method: 'PUT',
            body: payload,
          }
        );
    });
  });

  describe('delete', () => {
    it('deve chamar request com DELETE', async () => {
      await DeviceService.delete('123');

      expect(ApiService.request)
        .toHaveBeenCalledWith(
          '/devices/123',
          {
            method: 'DELETE',
          }
        );
    });
  });

  describe('linkPet', () => {
    it('deve vincular pet ao dispositivo', async () => {
      await DeviceService.linkPet(
        'device-1',
        'pet-1'
      );

      expect(ApiService.request)
        .toHaveBeenCalledWith(
          '/devices/device-1/link',
          {
            method: 'PUT',
            body: {
              pet_id: 'pet-1',
            },
          }
        );
    });
  });
});