import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import Login from '../../view/screens/Login';
import { useLoginViewModel } from '../../src/viewmodels/useLoginViewModel';

const mockNavigate = jest.fn();
const realizarLoginMock = jest.fn();

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('react-native-safe-area-context', () => {
  return {
    SafeAreaView: 'SafeAreaView',
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../src/viewmodels/useLoginViewModel', () => ({
  useLoginViewModel: jest.fn(),
}));

describe('Tela de login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLoginViewModel as jest.Mock).mockReturnValue({
      realizarLogin: realizarLoginMock,
      isLoading: false,
    });
  });

  it('deve renderizar campos de e-mail, senha e botão de entrada', async () => {
    const screen = await render(<Login />);

    expect(screen.getByText('Bem-vindo de volta')).toBeTruthy();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeTruthy();
    expect(screen.getByPlaceholderText('Sua senha')).toBeTruthy();
    expect(screen.getByText('Entrar')).toBeTruthy();
    expect(screen.getByText('Criar conta')).toBeTruthy();
  });

  it('deve chamar o ViewModel com e-mail e senha informados', async () => {
    const screen = await render(<Login />);

    await fireEvent.changeText(
      screen.getByPlaceholderText('seu@email.com'),
      'user@test.com'
    );
    await fireEvent.changeText(
      screen.getByPlaceholderText('Sua senha'),
      '123456'
    );
    await fireEvent.press(screen.getByText('Entrar'));

    expect(realizarLoginMock).toHaveBeenCalledWith(
      'user@test.com',
      '123456',
      false
    );
  });
});