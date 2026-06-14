import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Alert } from 'react-native';
import { AuthService } from '../src/services/AuthService';

export function useLoginViewModel() {
    const [isLoading, setIsLoading] = useState(false);
    async function realizarLogin(email: string, senha: string, manterConectado: boolean
    ) {
        if (!email || !senha) {
            Alert.alert(
                'Atenção',
                'Por favor, preencha e-mail e senha.'
            );
            return;
        }
        setIsLoading(true);
        try {
            if (manterConectado) {
                await AsyncStorage.setItem(
                    '@manter_conectado',
                    'true'
                );
            } else {
                await AsyncStorage.setItem(
                    '@manter_conectado',
                    'false'
                );
            }
            const usuario =
                await AuthService.login(email, senha);
            await AsyncStorage.setItem(
                '@usuario',
                JSON.stringify(usuario)
            );
        } catch (error: any) {
            Alert.alert(
                'Erro ao entrar',
                error.message
            );
        } finally {
            setIsLoading(false);
        }
    }
    return {
        realizarLogin,
        isLoading
    };
}