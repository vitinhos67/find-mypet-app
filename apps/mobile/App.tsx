import { Inter_400Regular, Inter_700Bold, Inter_900Black, useFonts } from '@expo-google-fonts/inter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeDatabase } from './src/database';
import { ThemeProvider } from './src/hooks/useTheme';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { TabNavigator } from './src/navigation/TabNavigator';
import { PushNotificationService } from './src/services/PushNotificationService';
import { supabase } from './src/shared/lib/supabase';
import { ErrorBoundary } from './src/view/components/ErrorBoundary';

const Stack = createNativeStackNavigator();

declare const ErrorUtils: {
    setGlobalHandler: (handler: (error: Error, isFatal?: boolean) => void) => void;
};

ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    const timestamp = new Date().toISOString();
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`[CRASH AUDIT] ${timestamp}`);
    console.error(`[CRASH AUDIT] Tipo: ${isFatal ? 'FATAL (JS global)' : 'Não-fatal (JS global)'}`);
    console.error(`[CRASH AUDIT] Mensagem: ${error.message}`);
    console.error(`[CRASH AUDIT] Stack:\n${error.stack}`);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

export default function App() {
    const [userLogado, setUserLogado] = useState(false);
    useFonts({ 'Inter-Regular': Inter_400Regular, 'Inter-Bold': Inter_700Bold, 'Inter-Black': Inter_900Black, });
    useEffect(() => {
        initializeDatabase().catch((error) => {
            console.log('Erro ao inicializar SQLite:', error);
        });

        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session) {
                const manter = await AsyncStorage.getItem('@manter_conectado');

                if (manter === "false") {
                    await supabase.auth.signOut();
                    setUserLogado(false);
                } else {
                    setUserLogado(true);
                    PushNotificationService.registerAndSync();
                }
            } else {
                setUserLogado(false);
            }
        });

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserLogado(!!session);
            if (session) {
                PushNotificationService.registerAndSync();
            }
        });
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);
    
    return (
        <ErrorBoundary>
            <SafeAreaProvider>
                <ThemeProvider>
                    <NavigationContainer>
                        {userLogado ? <TabNavigator /> : <AuthNavigator />}
                    </NavigationContainer>
                </ThemeProvider>
            </SafeAreaProvider>
        </ErrorBoundary>
    );
}
