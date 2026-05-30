import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../view/screens/HomeScreen';
import ProfileScreen from '../view/screens/ProfileScreen';
import { PetNavigator } from './PetNavigator';

const Tab = createBottomTabNavigator();

export function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
            />
            <Tab.Screen
                name="Pets"
                component={PetNavigator}
            />
            <Tab.Screen
                name="Perfil"
                component={ProfileScreen}
            />
        </Tab.Navigator>
    );
}