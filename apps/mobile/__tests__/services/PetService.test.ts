import { PetService } from '../../services/PetService';
import { ApiService } from '../../services/ApiService';
import { AuthService } from '../../services/AuthService';
import { PetLocalRepository } from '../../database';

jest.mock('../../services/ApiService', () => ({
  ApiService: {
    get: jest.fn(),
    post: jest.fn(),
    request: jest.fn(),
  },
}));

jest.mock('../../services/AuthService', () => ({
  AuthService: {
    getCurrentUserId: jest.fn(),
  },
}));

jest.mock('../../database', () => ({
  PetLocalRepository: {
    upsert: jest.fn(),
    findById: jest.fn(),
  },
}));

describe('PetService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('createPet', () => {
    it('deve criar um pet', async () => {
      const pet = {
        nome: 'Rex',
      };

      (ApiService.post as jest.Mock).mockResolvedValue({
        id: '1',
      });

      const result = await PetService.createPet(
        pet as any
      );

      expect(ApiService.post).toHaveBeenCalledWith(
        '/pets',
        pet
      );

      expect(result).toEqual({
        id: '1',
      });
    });
  });

  describe('getPets', () => {
    it('deve retornar lista de pets', async () => {
      (ApiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: [
          {
            id: '1',
            name: 'Rex',
            image_href: 'foto.jpg',
          },
        ],
      });

      const result = await PetService.getPets();

      expect(result).toEqual([
        {
          id: '1',
          foto: 'foto.jpg',
          nome: 'Rex',
          raca: '',
          cor: '',
          sexo: 'MACHO',
          descricao: '',
        },
      ]);
    });
  });

  describe('getPetById', () => {
    it('deve buscar pet pela api', async () => {
      (ApiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          id: '1',
          name: 'Rex',
        },
      });

      (AuthService.getCurrentUserId as jest.Mock)
        .mockResolvedValue('user123');

      const result = await PetService.getPetById('1');

      expect(result?.id).toBe('1');

      expect(PetLocalRepository.upsert)
        .toHaveBeenCalled();
    });

    it('deve buscar pet no cache quando api falhar', async () => {
      (ApiService.get as jest.Mock)
        .mockRejectedValue(new Error('Erro'));

      (AuthService.getCurrentUserId as jest.Mock)
        .mockResolvedValue('user123');

      (PetLocalRepository.findById as jest.Mock)
        .mockResolvedValue({
          id: '1',
          nome: 'Rex',
        });

      const result = await PetService.getPetById('1');

      expect(PetLocalRepository.findById)
        .toHaveBeenCalledWith(
          'user123',
          '1'
        );

      expect(result).toEqual({
        id: '1',
        nome: 'Rex',
      });
    });
  });

  describe('updatePet', () => {
    it('deve atualizar pet', async () => {
      (ApiService.request as jest.Mock)
        .mockResolvedValue({
          success: true,
        });

      const payload = {
        nome: 'Rex Atualizado',
      };

      await PetService.updatePet(
        '1',
        payload as any
      );

      expect(ApiService.request)
        .toHaveBeenCalledWith(
          '/pets/1',
          {
            method: 'PUT',
            body: payload,
          }
        );
    });
  });

  describe('deletePet', () => {
    it('deve excluir pet', async () => {
      (ApiService.request as jest.Mock)
        .mockResolvedValue({
          success: true,
        });

      await PetService.deletePet('1');

      expect(ApiService.request)
        .toHaveBeenCalledWith(
          '/pets/1',
          {
            method: 'DELETE',
          }
        );
    });
  });

  describe('toPetCache', () => {
    it('deve converter dados da api', () => {
      const result = PetService.toPetCache({
        id: '1',
        name: 'Rex',
        image_href: 'foto.jpg',
        raca: 'Labrador',
        cor: 'Caramelo',
        sexo: 'MACHO',
        descricao: 'Muito brincalhão',
      });

      expect(result).toEqual({
        id: '1',
        foto: 'foto.jpg',
        nome: 'Rex',
        raca: 'Labrador',
        cor: 'Caramelo',
        sexo: 'MACHO',
        descricao: 'Muito brincalhão',
      });
    });
  });
});