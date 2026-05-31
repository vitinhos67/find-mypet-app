import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
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
                <View>
                    <Text style={styles.title}>Meus Dispositivos</Text>
                    <Text style={styles.subtitle}>Gerencie suas coleiras</Text>
                </View>
                <Pressable
                    style={styles.btnAdd}
                    onPress={() => navigation.navigate('DeviceAdd')}
                >
                    <Text style={styles.btnAddText}>+ Nova</Text>
                </Pressable>
            </View>

            <FlatList
                data={devices}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardInfo}>
                            <Text style={styles.nomeText}>{item.nome}</Text>
                            <Text style={styles.serialText}>S/N: {item.serialNumber}</Text> 
                            <Text style={item.petId ? styles.statusVinculado : styles.statusLivre}>
                                {item.petId ? 'Vinculado a um Pet' : 'Pronto para uso'}
                            </Text>
                        </View>

                        <Pressable
                            style={styles.btnConfigurar}
                            onPress={() => navigation.navigate('DeviceConfigure', {
                                collarId: item.id,
                                currentPetId: item.petId
                            })}
                        >
                            <Text style={styles.btnConfigurarText}>Configurar</Text>
                        </Pressable>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Nenhuma coleira encontrada.</Text>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: Colors.light.background
    },
    header: { 
        padding: 20, 
        backgroundColor: 'white', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: Colors.brand.primaryBlue,
    },
    headerDark: {
        padding: 20,
        backgroundColor: Colors.dark.surface,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: Colors.brand.primaryBlue,
    },
    title: { 
        fontSize: 20, 
        fontFamily: 'Inter-Bold',
        color: Colors.brand.primaryBlue,
    },
    subtitle: { 
        fontSize: 14, 
        color: '#64748b', 
        marginTop: 4, 
        fontFamily: 'Inter-Bold',
    },
    btnAdd: { 
        backgroundColor: Colors.brand.primaryOrange, 
        paddingVertical: 8, 
        paddingHorizontal: 15, 
        borderRadius: 8 
    },
    btnAddText: { 
        color: 'white', 
        fontFamily: 'Inter-Bold',
    },
    listContainer: { 
        padding: 20, 
        gap: 15 
    },
    card: { 
        backgroundColor: 'white', 
        padding: 20, 
        borderRadius: 12, 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        elevation: 2 
    },
    cardInfo: { 
        flex: 1 
    },
    nomeText: {
        fontSize: 14,
        fontFamily: 'Inter-Bold',
        color: '#1e293b',
        marginBottom: 2
    },
    serialText: { 
        fontSize: 14, 
        fontFamily: 'Inter-Regular', 
        color: '#black', 
        marginBottom: 4 
    },
    statusVinculado: { 
        fontSize: 14, 
        color: '#black',        
        fontFamily: 'Inter-Bold', 
    },
    statusLivre: { 
        fontSize: 14, 
        color: "#5cb86b", 
        fontFamily: 'Inter-Bold',
    },
    btnConfigurar: { 
        backgroundColor: Colors.brand.primaryBlue,
        paddingVertical: 8, 
        paddingHorizontal: 16, 
        borderRadius: 8 
    },
    btnConfigurarText: { 
        color: 'white', 
    },
    emptyText: { 
        textAlign: 'center', 
        color: '#black', 
        marginTop: 40,
        fontFamily: 'Inter-Regular'
    }
});