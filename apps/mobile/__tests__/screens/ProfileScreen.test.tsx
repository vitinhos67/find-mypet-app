import React from 'react';
import { render } from '@testing-library/react-native';

import ProfileScreen from '../../view/screens/ProfileScreen';
import { useProfileViewModel } from '../../src/viewmodels/useProfileViewModel';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => {
  return {
    SafeAreaView: 'SafeAreaView',
  };
});

jest.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({
    darkMode: false,
    toggleTheme: jest.fn(),
  }),
}));

jest.mock('../../src/viewmodels/useProfileViewModel', () => ({
  useProfileViewModel: jest.fn(),
}));

describe('Tela de perfil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useProfileViewModel as jest.Mock).mockReturnValue({
      usuario: {
        nome: 'Maria Silva',
        email: 'maria@test.com',
        telefone: '11999999999',
        genero: 'Feminino',
      },
      profileImage: null,
      isEditing: false,
      isSaving: false,
      nome: '',
      telefone: '',
      genero: '',
      message: null,
      errorMessage: null,
      setNome: jest.fn(),
      setTelefone: jest.fn(),
      setGenero: jest.fn(),
      iniciarEdicao: jest.fn(),
      cancelarEdicao: jest.fn(),
      salvarPerfil: jest.fn(),
      salvarImagemPerfil: jest.fn(),
      realizarLogout: jest.fn(),
    });
  });

  it('deve renderizar dados do usuário e ações principais', async () => {
    const screen = await render(<ProfileScreen />);

    expect(screen.getByText('Perfil')).toBeTruthy();
    expect(screen.getByText('Maria Silva')).toBeTruthy();
    expect(screen.getByText('maria@test.com')).toBeTruthy();
    expect(screen.getByText('Editar perfil')).toBeTruthy();
    expect(screen.getByText('11999999999')).toBeTruthy();
    expect(screen.getByText('Feminino')).toBeTruthy();
    expect(screen.getByText('Sair da Conta')).toBeTruthy();
  });
});