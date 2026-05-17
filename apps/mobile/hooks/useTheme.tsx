import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';

type ThemeContextType = {
    darkMode: boolean;
    toggleTheme: () => void;
};

const ThemeContext =
    createContext({} as ThemeContextType);

type Props = {
    children: ReactNode;
};

export function ThemeProvider({ children }: Props) {

    const [darkMode, setDarkMode] =
        useState(false);

    useEffect(() => {
        carregarTema();
    }, []);

    async function carregarTema() {

        const temaSalvo =
            await AsyncStorage.getItem('@dark_mode');

        if (temaSalvo === 'true') {
            setDarkMode(true);
        }
    }

    async function toggleTheme() {

        const novoTema = !darkMode;

        setDarkMode(novoTema);

        await AsyncStorage.setItem(
            '@dark_mode',
            String(novoTema)
        );
    }

    return (

        <ThemeContext.Provider
            value={{
                darkMode,
                toggleTheme
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}