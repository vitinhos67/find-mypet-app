import { Inter_400Regular, Inter_700Bold, Inter_900Black, useFonts } from '@expo-google-fonts/inter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { AuthNavigator } from './navigation/AuthNavigator';
import { TabNavigator } from './navigation/TabNavigator';
import { supabase } from './src/shared/lib/supabase';
import { ThemeProvider } from './hooks/useTheme';
import { initializeDatabase } from './database';

const Stack = createNativeStackNavigator();


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
                }
            } else {
                setUserLogado(false);
            }
        });

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserLogado(!!session);
        });
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);
    
    return (
        <ThemeProvider>
            <NavigationContainer>
                {userLogado ? <TabNavigator /> : <AuthNavigator />}
            </NavigationContainer>
        </ThemeProvider>
    );
}
