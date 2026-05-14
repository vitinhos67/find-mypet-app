import { Inter_400Regular, Inter_700Bold, Inter_900Black, useFonts } from '@expo-google-fonts/inter';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Cadastro from './view/screens/Cadastro';
import Login from './view/screens/Login';
const Stack = createNativeStackNavigator();

export default function App() {
    const [fontsLoaded] = useFonts({ 'Inter-Regular': Inter_400Regular, 'Inter-Bold': Inter_700Bold, 'Inter-Black': Inter_900Black, });
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Cadastro" component={Cadastro} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}