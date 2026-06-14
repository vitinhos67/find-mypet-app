import React from 'react';
import { render } from '@testing-library/react-native';

import PetDetailsScreen from '../../src/view/screens/PetDetailsScreen';
import { usePetViewModel } from '../../src/viewmodels/usePetViewModel';

const mockGoBack = jest.fn();

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
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: {
      petId: 'pet-1',
    },
  }),
}));

jest.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({
    darkMode: false,
  }),
}));

jest.mock('../../src/viewmodels/usePetViewModel', () => ({
  usePetViewModel: jest.fn(),
}));

describe('Tela de detalhes do pet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePetViewModel as jest.Mock).mockReturnValue({
      getPetById: jest.fn(() => ({
        id: 'pet-1',
        foto: '',
        nome: 'Rex',
        raca: 'Vira-lata',
        cor: 'Caramelo',
        sexo: 'MACHO',
        descricao: 'Muito brincalhão',
      })),
      atualizarPet: jest.fn(),
      excluirPet: jest.fn(),
      carregarPetPorId: jest.fn(),
      selecionarFoto: jest.fn(),
      isLoading: false,
    });
  });

  it('deve renderizar as informações editáveis do pet', async () => {
    const screen = await render(<PetDetailsScreen />);

    expect(screen.getByText('Editar Pet')).toBeTruthy();
    expect(screen.getByDisplayValue('Rex')).toBeTruthy();
    expect(screen.getByDisplayValue('Vira-lata')).toBeTruthy();
    expect(screen.getByDisplayValue('Caramelo')).toBeTruthy();
    expect(screen.getByDisplayValue('Muito brincalhão')).toBeTruthy();
    expect(screen.getByText('Salvar Alterações')).toBeTruthy();
    expect(screen.getByText('Excluir Pet')).toBeTruthy();
  });
});
