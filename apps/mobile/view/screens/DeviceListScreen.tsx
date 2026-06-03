import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CollarStackParamList } from '../../navigation/types';
import { useDeviceViewModel } from '../../viewmodels/useDeviceViewModel';
import { Colors } from '../styles/color';

type NavigationProp = NativeStackNavigationProp<CollarStackParamList, 'DeviceList'>;

export default function DeviceListScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { devices, carregarColeiras } = useDeviceViewModel();

    useFocusEffect(
        useCallback(() => {
            carregarColeiras();
        }, [carregarColeiras])
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={28} color={Colors.brand.primaryBlue} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.title}>Dispositivos</Text>
                        <Text style={styles.subtitle}>Gerencie suas coleiras</Text>
                    </View>
                </View>
            </View>

            <FlatList
                data={devices}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card}
                        onPress={() => navigation.navigate('DeviceConfigure', {
                            collarId: item.id,
                            currentPetId: item.petId
                        })}>
                        <View style={styles.cardInfo}>
                            <Text style={styles.nomeText}>{item.nome}</Text>
                            <Text style={styles.serialText}>S/N: {item.serialNumber}</Text> 
                            <Text style={item.petId ? styles.statusVinculado : styles.statusLivre}>
                                {item.petId ? 'Vinculado a um Pet' : 'Pronto para uso'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Nenhuma coleira encontrada.</Text>
                }
            />
            <Pressable
                style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.85 : 1 }]}
                onPress={() => navigation.navigate('DeviceAdd')}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 20,
    }, 
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Inter-Bold',
        color: Colors.brand.primaryBlue,
        letterSpacing: -0.5,
        includeFontPadding: false,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: Colors.light.textSecondary,
        marginTop: 4,
    },
    btnAdd: {
        backgroundColor: Colors.brand.primaryOrange,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    backButton: {
        padding: 4,
        marginLeft: -8, 
    },
    btnAddText: {
        color: 'white',
        fontFamily: 'Inter-Bold',
        fontSize: 13,
    },

    listContainer: {
        paddingBottom: 100,
    },
    card: {
        backgroundColor: Colors.light.surface,
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.02,
        shadowRadius: 10,  
        elevation: 1,
    },
    cardInfo: {
        flex: 1,
        marginRight: 10,
    },
    nomeText: {
        fontSize: 16,
        fontFamily: 'Inter-Bold',
        color: Colors.light.textPrimary,
        marginBottom: 4,
    },
    serialText: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        color: Colors.light.textSecondary,
        marginBottom: 8,
    },
    statusVinculado: {
        fontSize: 12,
        fontFamily: 'Inter-Medium',
        color: Colors.brand.primaryBlue,
    },
    statusLivre: {
        fontSize: 12,
        fontFamily: 'Inter-Medium',
        color: '#22c55e',
    },
    btnConfigurar: {
        backgroundColor: Colors.brand.primaryBlue + '15', 
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
    },
    btnConfigurarText: {
        color: Colors.brand.primaryBlue,
        fontFamily: 'Inter-Bold',
        fontSize: 13,
    },

    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: Colors.light.textSecondary,
    }, 
    fab: {
        position: 'absolute',
        bottom: 28,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: Colors.brand.primaryOrange,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.brand.primaryOrange,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
});