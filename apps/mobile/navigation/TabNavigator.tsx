import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import HomeScreen from '../view/screens/HomeScreen';
import ProfileScreen from '../view/screens/ProfileScreen';
import { Colors } from '../view/styles/color';
import { PetNavigator } from './PetNavigator';

const Tab = createBottomTabNavigator();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
    Home:   { active: 'map',          inactive: 'map-outline' },
    Pets:   { active: 'paw',          inactive: 'paw-outline' },
    Perfil: { active: 'person',       inactive: 'person-outline' },
};

export function TabNavigator() {
    const { darkMode } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    const icons = TAB_ICONS[route.name];
                    const iconName = focused ? icons.active : icons.inactive;
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: Colors.brand.primaryBlue,
                tabBarInactiveTintColor: darkMode
                    ? Colors.dark.textSecondary
                    : Colors.light.textSecondary,
                tabBarStyle: {
                    backgroundColor: darkMode ? Colors.dark.surface : Colors.light.surface,
                    borderTopColor: darkMode ? Colors.dark.border : Colors.light.border,
                    borderTopWidth: 1,
                    height: 56 + insets.bottom,
                    paddingBottom: insets.bottom + 6,
                    paddingTop: 6,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontFamily: 'Inter-Medium',
                },
            })}
        >
            <Tab.Screen name="Home"   component={HomeScreen}   options={{ tabBarLabel: 'Home' }} />
            <Tab.Screen name="Pets"   component={PetNavigator} options={{ tabBarLabel: 'Pets' }} />
            <Tab.Screen name="Perfil" component={ProfileScreen} options={{ tabBarLabel: 'Perfil' }} />
        </Tab.Navigator>
    );
}
