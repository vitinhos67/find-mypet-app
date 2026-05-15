import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Alert } from 'react-native';
import { AuthService } from '../services/AuthService';

export function useLoginViewModel() {
    const [isLoading, setIsLoading] = useState(false);
    async function realizarLogin(email: string, senha: string, manterConectado: boolean) {
        if (!email || !senha) {
            Alert.alert('Atenção', 'Por favor, preencha e-mail e senha.');
            return
        }
        setIsLoading(true);
        try {
            if (manterConectado) {
                await AsyncStorage.setItem('@manter_conectado', 'true');
            } else {
                await AsyncStorage.setItem('@manter_conectado', 'false');
            }
            await AuthService.login(email, senha);
        }
        catch (error: any) {
            Alert.alert('Erro ao entrar', error.message);
        } finally {
            setIsLoading(false);
        }
    }
    return {
        realizarLogin,
        isLoading
    };
}