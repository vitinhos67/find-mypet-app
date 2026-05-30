import React from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';
import { useHomeViewModel } from '../../viewmodels/useHomeViewModel';
import { Colors } from '../styles/color';

export default function HomeScreen() {

    const { darkMode } = useTheme();

    const {
        pets,
        isLoading
    } = useHomeViewModel();

    return (
        <SafeAreaView
            style={[
                styles.container,
                darkMode && styles.containerDark
            ]}
        >

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

                {/* CONTENT */}
                <View style={styles.content}>

                    <Text
                        style={[
                            styles.sectionTitle,
                            darkMode && styles.textDark
                        ]}
                    >
                        PET'S
                    </Text>

                    {isLoading ? (

                        <Text
                            style={[
                                styles.loadingText,
                                darkMode && styles.textDark
                            ]}
                        >
                            Carregando pets...
                        </Text>

                    ) : (

                        pets.map((pet) => (

                            <View
                                key={pet.id}
                                style={styles.petContainer}
                            >

                                <View style={styles.petNameBox}>

                                    <Text style={styles.petName}>
                                        {pet.nome}
                                    </Text>

                                </View>

                                <View
                                    style={[
                                        styles.locationCard,
                                        darkMode &&
                                        styles.locationCardDark
                                    ]}
                                >

                                    <Text style={styles.locationText}>
                                        Última localização:
                                    </Text>

                                    <Text style={styles.locationValue}>
                                        {pet.ultimaLocalizacao}
                                    </Text>

                                </View>

                            </View>

                        ))

                    )}

                </View>

            </ScrollView>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },

    containerDark: {
        backgroundColor: '#121212',
    },

    header: {
        backgroundColor: Colors.brand.primaryBlue,
        width: '100%',
        height: 110,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },

    logoText: {
        color: 'white',
        fontSize: 24,
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
        fontSize: 20,
        color: 'black',
        marginBottom: 20,
        fontFamily: 'Inter-Bold',
    },

    textDark: {
        color: 'white',
    },

    loadingText: {
        fontSize: 18,
        color: 'black',
    },

    petContainer: {
        marginBottom: 35,
    },

    petNameBox: {
        backgroundColor: Colors.brand.primaryBlue,
        alignSelf: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginBottom: 10,
    },

    petName: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },

    locationCard: {
        backgroundColor: Colors.brand.primaryOrange,
        borderRadius: 10,
        paddingVertical: 20,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },

    locationCardDark: {
        backgroundColor: Colors.brand.primaryBlue,
    },

    locationText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Inter-Bold',
        textAlign: 'center',
    },

    locationValue: {
        color: 'white',
        fontSize: 14,
        marginTop: 10,
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
    },

});