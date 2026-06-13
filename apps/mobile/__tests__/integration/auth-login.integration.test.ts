import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook } from '@testing-library/react-native';

import { supabase } from '../../src/shared/lib/supabase';
import { useLoginViewModel } from '../../viewmodels/useLoginViewModel';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('../../src/shared/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
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

describe('Fluxo de autenticação e login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: {
        user: authUser,
        session: { access_token: 'access-token' },
      },
      error: null,
    });
  });

  it('deve salvar as preferências de sessão após autenticar com Supabase Auth', async () => {
    const { result } = await renderHook(() => useLoginViewModel());

    await act(async () => {
      await result.current.realizarLogin('user@test.com', '123456', true);
    });

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: '123456',
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@manter_conectado',
      'true'
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@usuario',
      JSON.stringify({
        user: authUser,
        session: { access_token: 'access-token' },
      })
    );
  });
});
