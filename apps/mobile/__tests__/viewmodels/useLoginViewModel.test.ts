import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthService } from '../../src/services/AuthService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
}));

jest.mock('../../src/services/AuthService', () => ({
  AuthService: {
    login: jest.fn(),
  },
}));

describe('Lógica de Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve realizar login com sucesso', async () => {
    (AuthService.login as jest.Mock).mockResolvedValue({
      user: {
        id: '123',
      },
    });

    await AsyncStorage.setItem(
      '@manter_conectado',
      'true'
    );

    const usuario = await AuthService.login(
      'teste@email.com',
      '123456'
    );

    await AsyncStorage.setItem(
      '@usuario',
      JSON.stringify(usuario)
    );

    expect(AuthService.login).toHaveBeenCalledWith(
      'teste@email.com',
      '123456'
    );

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@manter_conectado',
      'true'
    );

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@usuario',
      JSON.stringify(usuario)
    );
  });

  it('deve exibir erro quando login falhar', async () => {
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation(() => {});

    (AuthService.login as jest.Mock).mockRejectedValue(
      new Error('E-mail ou senha incorretos.')
    );

    try {
      await AuthService.login(
        'teste@email.com',
        'senhaerrada'
      );
    } catch (error: any) {
      Alert.alert(
        'Erro ao entrar',
        error.message
      );
    }

    expect(alertSpy).toHaveBeenCalledWith(
      'Erro ao entrar',
      'E-mail ou senha incorretos.'
    );
  });
});