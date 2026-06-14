
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import DeviceAddScreen from '../view/screens/DeviceAddScreen';
import DeviceConfigureScreen from '../view/screens/DeviceConfigureScreen';
import DeviceListScreen from '../view/screens/DeviceListScreen';
import { CollarStackParamList } from './types';

const Stack = createNativeStackNavigator<CollarStackParamList>();

export function CollarNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right'
            }}
        >
            <Stack.Screen 
                name="DeviceList" component={DeviceListScreen} 
            />
            <Stack.Screen 
                name="DeviceConfigure" component={DeviceConfigureScreen} 
            />
            <Stack.Screen 
                name="DeviceAdd" component={DeviceAddScreen} 
            />
        </Stack.Navigator>
    );
}
