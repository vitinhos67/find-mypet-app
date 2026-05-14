import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Text, View } from 'react-native';


function HomeScreen() { 
    return <View><Text>Apenas Teste</Text></View>; }


const Tab = createBottomTabNavigator();

export function TabNavigator() {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Home" component={HomeScreen} />
        </Tab.Navigator>
    );
}