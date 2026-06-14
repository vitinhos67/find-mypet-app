import { AuthService } from '../../src/services/AuthService';
import { supabase } from '../../src/shared/lib/supabase';

jest.mock('../../src/shared/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      getSession: jest.fn(),
    },
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve realizar login com sucesso', async () => {
      const mockData = {
        user: {
          id: '123',
          email: 'teste@email.com',
        },
      };

      (supabase.auth.signInWithPassword as jest.Mock)
        .mockResolvedValue({
          data: mockData,
          error: null,
        });

      const resultado = await AuthService.login(
        'teste@email.com',
        '123456'
      );

      expect(resultado).toEqual(mockData);
    });

    it('deve lançar erro para credenciais inválidas', async () => {
      (supabase.auth.signInWithPassword as jest.Mock)
        .mockResolvedValue({
          data: null,
          error: {
            message: 'Invalid login credentials',
          },
        });

      await expect(
        AuthService.login(
          'teste@email.com',
          'senhaerrada'
        )
      ).rejects.toThrow(
        'E-mail ou senha incorretos.'
      );
    });
  });

  describe('getCurrentUserId', () => {
    it('deve retornar o id do usuário logado', async () => {
      (supabase.auth.getSession as jest.Mock)
        .mockResolvedValue({
          data: {
            session: {
              user: {
                id: 'abc123',
              },
            },
          },
        });

      const resultado =
        await AuthService.getCurrentUserId();

      expect(resultado).toBe('abc123');
    });

    it('deve retornar null quando não existir sessão', async () => {
      (supabase.auth.getSession as jest.Mock)
        .mockResolvedValue({
          data: {
            session: null,
          },
        });

      const resultado =
        await AuthService.getCurrentUserId();

      expect(resultado).toBeNull();
    });
  });

  describe('cadastrar', () => {
    it('deve cadastrar usuário com sucesso', async () => {
      const mockData = {
        user: {
          id: '123',
        },
      };

      (supabase.auth.signUp as jest.Mock)
        .mockResolvedValue({
          data: mockData,
          error: null,
        });

      const resultado =
        await AuthService.cadastrar(
          'teste@email.com',
          '123456',
          'Heron',
          '999999999',
          'Masculino'
        );

      expect(resultado).toEqual(mockData);
    });
  });
});