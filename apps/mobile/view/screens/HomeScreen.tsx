import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
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

    const { pets, isLoading, carregarPets } = useHomeViewModel();
    useFocusEffect(
        useCallback(() => {
            carregarPets();
        }, [])
    );
    return (
        <SafeAreaView
            style={[
                styles.container,
                darkMode && styles.containerDark
            ]}
        >

            <ScrollView showsVerticalScrollIndicator={false}>

                {/* HEADER */}
                <View style={[styles.header ,darkMode && styles.headerDark]}>

                    <Text style={[styles.logoText, darkMode && styles.logoTextDark] }>
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
                            <View key={pet.id} style={styles.petContainer}>
                                <View style={styles.petHeader}>
                                    <View style={styles.petNameBox}>
                                        <Text style={styles.petName} numberOfLines={1}>{pet.nome}</Text>
                                    </View>
                                    {pet.nomeColeira ? (
                                        <View style={styles.badgeRastreado}>
                                            <Ionicons name="hardware-chip" size={14} color={Colors.brand.primaryBlue} />
                                            <Text style={styles.badgeRastreadoText} numberOfLines={1} ellipsizeMode="tail">
                                                {pet.nomeColeira}
                                            </Text>
                                        </View>
                                    ) : (
                                        <View style={styles.badgeSemColeira}>
                                            <Ionicons name="alert-circle-outline" size={14} color="#94a3b8" />
                                            <Text style={styles.badgeSemColeiraText}>
                                                Sem coleira
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <View style={[styles.locationCard, darkMode && styles.locationCardDark]}>
                                    <Text style={styles.locationText}>Última localização:</Text>
                                    <Text style={styles.locationValue}>{pet.ultimaLocalizacao}</Text>
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
        backgroundColor: Colors.dark.background,
    },

    header: {
        backgroundColor: 'white',
        width: '100%',
        height: 110,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderColor: Colors.brand.primaryOrange,
    },
    headerDark:{
        backgroundColor:  Colors.dark.surface,
        width: '100%',
        height: 110,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderColor: Colors.brand.primaryBlue,
    },

    logoText: {
        color: Colors.brand.primaryBlue,
        fontSize: 24,
        fontFamily: 'Inter-Black',
        width: '55%',
    }, 
    logoTextDark: {
        color: Colors.brand.primaryOrange,
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
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 10, 
        flexShrink: 1,
    },
    petName: {
        color: 'white',
        fontFamily: 'Inter-Bold',
        fontSize: 14,
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
    petHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        gap: 10,
    },
    badgeRastreado: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f9ff', 
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.brand.primaryBlue,
        gap: 4, 
        flexShrink: 1,
    },
    badgeRastreadoText: {
        color: Colors.brand.primaryBlue,
        fontFamily: 'Inter-Bold',
        fontSize: 12,
        flexShrink: 1,
    },
    badgeSemColeira: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 4,
    },
    badgeSemColeiraText: {
        color: '#64748b',
        fontFamily: 'Inter-Medium',
        fontSize: 12,
    },

});