import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PetAddScreen from '../view/screens/PetAddScreen';
import PetDetailsScreen from '../view/screens/PetDetailsScreen';
import PetListScreen from '../view/screens/PetListScreen';
import { CollarNavigator } from './CollarNavigator';
import { PetStackParamList } from './types';

const Stack = createNativeStackNavigator<PetStackParamList>();

export function PetNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right'
            }}
        >
            <Stack.Screen
                name="PetList"
                component={PetListScreen}
            />

            <Stack.Screen
                name="PetAdd"
                component={PetAddScreen}
            />

            <Stack.Screen
                name="PetDetails"
                component={PetDetailsScreen}
            />
            <Stack.Screen 
                name="Collar" 
                component={CollarNavigator} 
            />
        </Stack.Navigator>
    );
}