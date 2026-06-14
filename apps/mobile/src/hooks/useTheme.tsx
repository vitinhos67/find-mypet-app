import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
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

type ThemeState = {
    darkMode: boolean;
};

type ThemeAction =
    | { type: 'set'; darkMode: boolean }
    | { type: 'toggle' };

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
    switch (action.type) {
        case 'set':
            return { darkMode: action.darkMode };
        case 'toggle':
            return { darkMode: !state.darkMode };
        default:
            return state;
    }
}

export function ThemeProvider({ children }: Props) {

    const [state, dispatch] = React.useReducer(themeReducer, {
        darkMode: false,
    });

    useEffect(() => {
        carregarTema();
    }, []);

    async function carregarTema() {

        const temaSalvo =
            await AsyncStorage.getItem('@dark_mode');

        if (temaSalvo === 'true') {
            dispatch({ type: 'set', darkMode: true });
        }
    }

    async function toggleTheme() {

        const novoTema = !state.darkMode;

        dispatch({ type: 'toggle' });

        await AsyncStorage.setItem(
            '@dark_mode',
            String(novoTema)
        );
    }

    return (

        <ThemeContext.Provider
            value={{
                darkMode: state.darkMode,
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