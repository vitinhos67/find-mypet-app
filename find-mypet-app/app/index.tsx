import { View, Text } from 'react-native';

export default function HomeScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Find MyPet</Text>
            <Text>Criação inicial arquitetura NVVM</Text>
        </View>
    );
}