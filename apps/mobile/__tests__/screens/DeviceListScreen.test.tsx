import React from 'react';
import { render } from '@testing-library/react-native';

import DeviceListScreen from '../../view/screens/DeviceListScreen';
import { useDeviceViewModel } from '../../src/viewmodels/useDeviceViewModel';

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

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
    navigate: mockNavigate,
  }),
  useFocusEffect: (callback: () => void) => callback(),
}));

jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    darkMode: false,
  }),
}));

jest.mock('../../src/viewmodels/useDeviceViewModel', () => ({
  useDeviceViewModel: jest.fn(),
}));

describe('Tela de lista de dispositivos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useDeviceViewModel as jest.Mock).mockReturnValue({
      devices: [
        {
          id: 'device-1',
          nome: 'Coleira Rex',
          serialNumber: 'SN123',
          wifiSsid: 'Casa',
          wifiSenha: 'senha',
          petId: 'pet-1',
          status: 'ONLINE',
          batteryLevel: 88,
          intervaloAcordarMinutos: 15,
          comportamentoSemWifi: 'STORE',
        },
      ],
      carregarColeiras: jest.fn(),
    });
  });

  it('deve renderizar dispositivo cadastrado e vínculo com pet', async () => {
    const screen = await render(<DeviceListScreen />);

    expect(screen.getByText('Dispositivos')).toBeTruthy();
    expect(screen.getByText('1 coleira no total')).toBeTruthy();
    expect(screen.getByText('Coleira Rex')).toBeTruthy();
    expect(screen.getByText('S/N: SN123')).toBeTruthy();
    expect(screen.getByText('Vinculado a um Pet')).toBeTruthy();
  });
});