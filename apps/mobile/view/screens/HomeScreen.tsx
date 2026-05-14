import React from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Colors } from '../styles/color';

type PetType = {
    id: number;
    nome: string;
    ultimaLocalizacao: string;
};

export default function HomeScreen() {

    //aqui mais pra frente terá a api do maps pra exibir a loc
    const pets: PetType[] = [
        {
            id: 1,
            nome: 'Rex',
            ultimaLocalizacao: 'Avenida Brasil',
        },
        {
            id: 2,
            nome: 'Mel',
            ultimaLocalizacao: 'Praça Central',
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.logoText}>
                        Find My PET
                    </Text>

                    <Image
                        source={require('../../assets/images/logo-pet.png')}
                        style={styles.headerImage}
                    />
                </View>

                {/* PETS */}
                <View style={styles.content}>

                    <Text style={styles.sectionTitle}>
                        PET'S
                    </Text>

                    {pets.map((pet) => (
                        <View key={pet.id} style={styles.petContainer}>

                            {/* NOME PET */}
                            <View style={styles.petNameBox}>
                                <Text style={styles.petName}>
                                    {pet.nome}
                                </Text>
                            </View>

                            {/* CARD LOCALIZAÇÃO */}
                            <View style={styles.locationCard}>
                                <Text style={styles.locationText}>
                                    Última localização:
                                </Text>

                                <Text style={styles.locationValue}>
                                    {pet.ultimaLocalizacao}
                                </Text>
                            </View>

                        </View>
                    ))}

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F2',
    },

    header: {
        backgroundColor: Colors.primaryBlue,
        width: '100%',
        height: 110,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },

    logoText: {
        color: 'white',
        fontSize: 34,
        fontFamily: 'Inter-Black',
        width: '55%',
    },

    headerImage: {
        width: 140,
        height: 100,
        resizeMode: 'contain',
    },

    content: {
        padding: 20,
    },

    sectionTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 25,
    },

    petContainer: {
        marginBottom: 35,
    },

    petNameBox: {
        backgroundColor: Colors.primaryBlue,
        alignSelf: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 30,
        borderRadius: 30,
        marginBottom: 20,
    },

    petName: {
        color: 'white',
        fontSize: 26,
        fontWeight: 'bold',
    },

    locationCard: {
        backgroundColor: Colors.primaryOrange,
        borderRadius: 28,
        paddingVertical: 40,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },

    locationText: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    locationValue: {
        color: 'white',
        fontSize: 20,
        marginTop: 10,
        fontWeight: '600',
        textAlign: 'center',
    },
});