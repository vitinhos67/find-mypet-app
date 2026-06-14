import React from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeProvider, useTheme } from '../../src/hooks/useTheme';

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
}));

function ThemeConsumer() {
    const { darkMode, toggleTheme } = useTheme();

    return (
        <>
            <Text testID="theme-state">
                {darkMode ? 'escuro' : 'claro'}
            </Text>
            <Pressable testID="theme-toggle" onPress={toggleTheme}>
                <Text>Alternar tema</Text>
            </Pressable>
        </>
    );
}

describe('ThemeProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    });

    it('deve alternar o tema usando useReducer', async () => {
        const useReducerSpy = jest.spyOn(React, 'useReducer');

        const screen = await render(
            <ThemeProvider>
                <ThemeConsumer />
            </ThemeProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('theme-state').props.children).toBe('claro');
        });

        await fireEvent.press(screen.getByTestId('theme-toggle'));

        expect(screen.getByTestId('theme-state').props.children).toBe('escuro');
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('@dark_mode', 'true');
        expect(useReducerSpy).toHaveBeenCalled();

        useReducerSpy.mockRestore();
    });
});