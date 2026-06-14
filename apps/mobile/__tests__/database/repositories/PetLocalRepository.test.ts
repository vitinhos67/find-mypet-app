import { PetLocalRepository } from '../../../database/repositories/PetLocalRepository';
import { Pet } from '../../../src/models/pet.model';
import { initializeDatabase } from '../../../database/migrations';
import { getDatabase } from '../../../database/sqlite';

type PetCacheEntry = {
  payload_json: string;
  updated_at: string;
  synced_at: string;
};

const mockStore = new Map<string, Map<string, PetCacheEntry>>();

const mockDb = {
  runAsync: jest.fn(async (sql: string, ...params: unknown[]) => {
    if (sql.includes('DELETE FROM pets_cache')) {
      const [userId] = params as [string];
      mockStore.delete(userId);
      return;
    }

    if (sql.includes('INSERT INTO pets_cache')) {
      const [userId, petId, payloadJson, updatedAt, syncedAt] = params as [
        string,
        string,
        string,
        string,
        string
      ];
      const userPets = mockStore.get(userId) ?? new Map<string, PetCacheEntry>();
      userPets.set(petId, {
        payload_json: payloadJson,
        updated_at: updatedAt,
        synced_at: syncedAt,
      });
      mockStore.set(userId, userPets);
    }
  }),
  getAllAsync: jest.fn(async (_sql: string, userId: string) => {
    const userPets = Array.from(mockStore.get(userId)?.values() ?? []);
    return userPets
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .map(({ payload_json }) => ({ payload_json }));
  }),
  getFirstAsync: jest.fn(async (_sql: string, userId: string, petId: string) => {
    const row = mockStore.get(userId)?.get(petId);
    return row ? { payload_json: row.payload_json } : null;
  }),
  withTransactionAsync: jest.fn(async (callback: () => Promise<void>) => {
    await callback();
  }),
};

jest.mock('../../../database/migrations', () => ({
  initializeDatabase: jest.fn(),
}));

jest.mock('../../../database/sqlite', () => ({
  getDatabase: jest.fn(),
}));

function makePet(overrides: Partial<Pet> = {}): Pet {
  return {
    id: 'pet-1',
    foto: 'pet.jpg',
    nome: 'Rex',
    raca: 'Vira-lata',
    cor: 'Caramelo',
    sexo: 'MACHO',
    descricao: 'Brincalhao',
    ...overrides,
  };
}

describe('PetLocalRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.clear();
    (initializeDatabase as jest.Mock).mockResolvedValue(undefined);
    (getDatabase as jest.Mock).mockResolvedValue(mockDb);
  });

  it('deve salvar um pet vinculado ao user_id no upsert', async () => {
    const pet = makePet();

    await PetLocalRepository.upsert('user-1', pet);

    expect(initializeDatabase).toHaveBeenCalled();
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO pets_cache'),
      'user-1',
      'pet-1',
      JSON.stringify(pet),
      expect.any(String),
      expect.any(String)
    );
    await expect(PetLocalRepository.findById('user-1', 'pet-1'))
      .resolves.toEqual(pet);
  });

  it('deve substituir os pets vinculados ao user_id usando replaceAll', async () => {
    await PetLocalRepository.upsert('user-1', makePet({ id: 'old-pet' }));
    await PetLocalRepository.upsert('user-2', makePet({ id: 'other-user-pet' }));

    const newPets = [
      makePet({ id: 'pet-1', nome: 'Rex' }),
      makePet({ id: 'pet-2', nome: 'Luna', sexo: 'FEMEA' }),
    ];

    await PetLocalRepository.replaceAll('user-1', newPets);

    expect(mockDb.withTransactionAsync).toHaveBeenCalled();
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      'DELETE FROM pets_cache WHERE user_id = ?;',
      'user-1'
    );
    await expect(PetLocalRepository.findAll('user-1'))
      .resolves.toEqual(newPets);
    await expect(PetLocalRepository.findById('user-2', 'other-user-pet'))
      .resolves.toEqual(makePet({ id: 'other-user-pet' }));
  });

  it('deve retornar apenas os pets do user_id solicitado usando findAll', async () => {
    const userPet = makePet({ id: 'pet-1', nome: 'Rex' });
    const otherUserPet = makePet({ id: 'pet-2', nome: 'Luna' });

    await PetLocalRepository.upsert('user-1', userPet);
    await PetLocalRepository.upsert('user-2', otherUserPet);

    await expect(PetLocalRepository.findAll('user-1'))
      .resolves.toEqual([userPet]);
  });

  it('deve retornar o pet solicitado vinculado ao user_id usando findById', async () => {
    const pet = makePet({ id: 'pet-1', nome: 'Rex' });

    await PetLocalRepository.upsert('user-1', pet);

    await expect(PetLocalRepository.findById('user-1', 'pet-1'))
      .resolves.toEqual(pet);
    expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('WHERE user_id = ? AND id = ?'),
      'user-1',
      'pet-1'
    );
  });

  it('deve retornar null quando nenhum registro existir usando findById', async () => {
    await expect(PetLocalRepository.findById('user-1', 'missing-pet'))
      .resolves.toBeNull();
  });

  it('deve converter o payload_json de volta para o modelo Pet do mobile', async () => {
    const pet = makePet({
      id: 'pet-json',
      nome: 'Nina',
      sexo: 'FEMEA',
      isShared: true,
      sharePermission: 'VIEW',
    });

    mockStore.set('user-1', new Map([
      [
        pet.id,
        {
          payload_json: JSON.stringify(pet),
          updated_at: '2026-01-01T00:00:00.000Z',
          synced_at: '2026-01-01T00:00:00.000Z',
        },
      ],
    ]));

    await expect(PetLocalRepository.findAll('user-1'))
      .resolves.toEqual([pet]);
  });

  it('não deve misturar dados de diferentes user_ids', async () => {
    const sharedIdForUserOne = makePet({ id: 'same-pet-id', nome: 'Rex' });
    const sharedIdForUserTwo = makePet({
      id: 'same-pet-id',
      nome: 'Luna',
      sexo: 'FEMEA',
    });

    await PetLocalRepository.upsert('user-1', sharedIdForUserOne);
    await PetLocalRepository.upsert('user-2', sharedIdForUserTwo);

    await expect(PetLocalRepository.findById('user-1', 'same-pet-id'))
      .resolves.toEqual(sharedIdForUserOne);
    await expect(PetLocalRepository.findById('user-2', 'same-pet-id'))
      .resolves.toEqual(sharedIdForUserTwo);
  });
});
