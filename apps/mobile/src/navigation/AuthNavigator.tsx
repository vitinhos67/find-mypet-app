import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Cadastro from '../view/screens/Cadastro';
import Login from '../view/screens/Login';
import { AuthStackParams } from './types';

const Stack = createNativeStackNavigator<AuthStackParams>();

export function AuthNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Cadastro" component={Cadastro} />
        </Stack.Navigator>
    );
}
