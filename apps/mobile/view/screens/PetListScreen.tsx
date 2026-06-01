import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';
import { PetStackParamList } from '../../navigation/types';
import { usePetViewModel } from '../../viewmodels/usePetViewModel';
import { Colors } from '../styles/color';

type NavigationProp = NativeStackNavigationProp<PetStackParamList, 'PetList', 'Colar'>;

export default function PetListScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { pets, isLoading, carregarPets } = usePetViewModel();
    const { darkMode } = useTheme();
    const theme = darkMode ? Colors.dark : Colors.light;

    useFocusEffect(
        useCallback(() => {
            carregarPets();
        }, [carregarPets])
    );

    const totalLabel = pets.length === 1
        ? '1 pet cadastrado'
        : pets.length > 1
            ? `${pets.length} pets cadastrados`
            : 'Nenhum pet cadastrado';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.surface }]}>
                <View>
                    <Text style={[styles.title, { color: Colors.brand.primaryBlue }]}>Meus Pets</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{totalLabel}</Text>
                </View>
                <Pressable
                    style={[styles.coleirasBtn, { borderColor: theme.border }]}
                    onPress={() => navigation.navigate('Collar' as any)}
                >
                    <Text style={[styles.coleirasBtnText, { color: theme.textSecondary }]}>
                        Coleiras
                    </Text>
                </Pressable>
            </View>

            {isLoading && pets.length === 0 ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.brand.primaryBlue} />
                </View>
            ) : (
                <FlatList
                    data={pets}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[
                        styles.listContainer,
                        pets.length === 0 && styles.emptyContainer
                    ]}
                    renderItem={({ item }) => (
                        <Pressable
                            style={({ pressed }) => [
                                styles.card,
                                { backgroundColor: theme.surface, opacity: pressed ? 0.82 : 1 }
                            ]}
                            onPress={() => navigation.navigate('PetProfile', { petId: item.id })}
                        >
                            {item.foto ? (
                                <Image source={{ uri: item.foto }} style={styles.petImage} />
                            ) : (
                                <View style={[styles.placeholder, { backgroundColor: theme.border }]}>
                                    <Text style={styles.placeholderIcon}>🐾</Text>
                                </View>
                            )}

                            <View style={styles.cardContent}>
                                <Text style={[styles.nomeText, { color: theme.textPrimary }]}>
                                    {item.nome}
                                </Text>
                                <Text style={[styles.racaText, { color: theme.textSecondary }]}>
                                    {item.raca}
                                </Text>
                            </View>

                            <View style={[
                                styles.sexoBadge,
                                { backgroundColor: item.sexo === 'MACHO' ? '#dbeafe' : '#fce7f3' }
                            ]}>
                                <Text style={[
                                    styles.sexoBadgeText,
                                    { color: item.sexo === 'MACHO' ? Colors.brand.primaryBlue : '#ec4899' }
                                ]}>
                                    {item.sexo === 'MACHO' ? '♂' : '♀'}
                                </Text>
                            </View>
                        </Pressable>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>🐾</Text>
                            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                                Nenhum pet ainda
                            </Text>
                            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                                Toque no botão + para cadastrar seu primeiro pet
                            </Text>
                        </View>
                    }
                />
            )}

            <Pressable
                style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.85 : 1 }]}
                onPress={() => navigation.navigate('PetAdd')}
            >
                <Text style={styles.fabText}>+</Text>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },

    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: Colors.brand.primaryOrange + '50'
    },

    title: {
        fontSize: 22,
        fontFamily: 'Inter-Bold'
    },

    subtitle: {
        fontSize: 13,
        marginTop: 2,
        fontFamily: 'Inter-Regular'
    },

    coleirasBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1
    },

    coleirasBtnText: {
        fontSize: 13,
        fontFamily: 'Inter-Bold'
    },

    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    listContainer: {
        padding: 16,
        gap: 10,
        paddingBottom: 88
    },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center'
    },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 14,
        gap: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4
    },

    petImage: {
        width: 54,
        height: 54,
        borderRadius: 27
    },

    placeholder: {
        width: 54,
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center'
    },

    placeholderIcon: {
        fontSize: 22
    },

    cardContent: {
        flex: 1
    },

    nomeText: {
        fontSize: 16,
        fontFamily: 'Inter-Bold'
    },

    racaText: {
        fontSize: 13,
        marginTop: 2,
        fontFamily: 'Inter-Regular'
    },

    sexoBadge: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center'
    },

    sexoBadgeText: {
        fontSize: 18
    },

    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40
    },

    emptyIcon: {
        fontSize: 56,
        marginBottom: 16
    },

    emptyTitle: {
        fontSize: 18,
        fontFamily: 'Inter-Bold',
        marginBottom: 8
    },

    emptySubtitle: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
        lineHeight: 22
    },

    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.brand.primaryOrange,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: Colors.brand.primaryOrange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8
    },

    fabText: {
        color: 'white',
        fontSize: 30,
        fontFamily: 'Inter-Bold',
        lineHeight: 34
    }
});
