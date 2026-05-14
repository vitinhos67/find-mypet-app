import { Inter_400Regular, Inter_700Bold, Inter_900Black, useFonts } from '@expo-google-fonts/inter';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { AuthNavigator } from './navigation/AuthNavigator';
import { TabNavigator } from './navigation/TabNavigator';

const Stack = createNativeStackNavigator();


export default function App() {
    const [userLogado, setUserLogado] = useState(true);
    useFonts({ 'Inter-Regular': Inter_400Regular, 'Inter-Bold': Inter_700Bold, 'Inter-Black': Inter_900Black, });
    return (
        <NavigationContainer>
            {userLogado ? <TabNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}