import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';
import { Pet } from '../../models/pet.model';
import { PetStackParamList } from '../../navigation/types';
import { usePetViewModel } from '../../viewmodels/usePetViewModel';
import { Colors } from '../styles/color';

type NavigationProp = NativeStackNavigationProp<PetStackParamList, 'PetList', 'Colar'>;

function PetCard({
    item,
    onPress,
    theme
}: {
    item: Pet;
    onPress: () => void;
    theme: any;
}) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                { backgroundColor: theme.surface, opacity: pressed ? 0.82 : 1 }
            ]}
            onPress={onPress}
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
                {item.isShared && item.sharePermission && (
                    <View style={[
                        styles.permissionTag,
                        { backgroundColor: item.sharePermission === 'EDIT' ? '#fef3c7' : '#dbeafe' }
                    ]}>
                        <Text style={[
                            styles.permissionTagText,
                            { color: item.sharePermission === 'EDIT' ? '#b45309' : Colors.brand.primaryBlue }
                        ]}>
                            {item.sharePermission === 'EDIT' ? 'Pode editar' : 'Visualização'}
                        </Text>
                    </View>
                )}
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
    );
}

export default function PetListScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { pets, sharedPets, isLoading, carregarPets } = usePetViewModel();
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

    if (isLoading && pets.length === 0 && sharedPets.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={[styles.header, { backgroundColor: theme.surface }]}>
                    <View>
                        <Text style={[styles.title, { color: Colors.brand.primaryBlue }]}>Pets</Text>
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
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.brand.primaryBlue} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.surface }]}>
                <View>
                    <Text style={[styles.title, { color: Colors.brand.primaryBlue }]}>Pets</Text>
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

            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    pets.length === 0 && sharedPets.length === 0 && styles.emptyScrollContent
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Seção: Meus Pets */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                        Meus Pets
                    </Text>

                    {pets.length === 0 ? (
                        <View style={[styles.emptySection, { backgroundColor: theme.surface }]}>
                            <Text style={styles.emptySectionIcon}>🐾</Text>
                            <Text style={[styles.emptySectionTitle, { color: theme.textPrimary }]}>
                                Nenhum pet ainda
                            </Text>
                            <Text style={[styles.emptySectionSubtitle, { color: theme.textSecondary }]}>
                                Toque no botão + para cadastrar seu primeiro pet
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.cardList}>
                            {pets.map((item) => (
                                <PetCard
                                    key={item.id}
                                    item={item}
                                    theme={theme}
                                    onPress={() => navigation.navigate('PetProfile', { petId: item.id })}
                                />
                            ))}
                        </View>
                    )}
                </View>

                {/* Seção: Compartilhados comigo */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                        Compartilhados comigo
                    </Text>

                    {sharedPets.length === 0 ? (
                        <View style={[styles.emptySection, { backgroundColor: theme.surface }]}>
                            <Text style={styles.emptySectionIcon}>🔗</Text>
                            <Text style={[styles.emptySectionTitle, { color: theme.textPrimary }]}>
                                Sem pets compartilhados
                            </Text>
                            <Text style={[styles.emptySectionSubtitle, { color: theme.textSecondary }]}>
                                Quando alguém compartilhar um pet com você, ele aparecerá aqui
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.cardList}>
                            {sharedPets.map((item) => (
                                <PetCard
                                    key={item.id}
                                    item={item}
                                    theme={theme}
                                    onPress={() => navigation.navigate('PetProfile', { petId: item.id })}
                                />
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

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

    scrollContent: {
        padding: 16,
        paddingBottom: 100,
        gap: 8
    },

    emptyScrollContent: {
        flex: 1
    },

    section: {
        gap: 10,
        marginBottom: 8
    },

    sectionTitle: {
        fontSize: 15,
        fontFamily: 'Inter-Bold',
        paddingHorizontal: 2
    },

    cardList: {
        gap: 10
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
        flex: 1,
        gap: 2
    },

    nomeText: {
        fontSize: 16,
        fontFamily: 'Inter-Bold'
    },

    racaText: {
        fontSize: 13,
        fontFamily: 'Inter-Regular'
    },

    permissionTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 20,
        marginTop: 2
    },

    permissionTagText: {
        fontSize: 10,
        fontFamily: 'Inter-Bold'
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

    emptySection: {
        alignItems: 'center',
        paddingVertical: 28,
        paddingHorizontal: 24,
        borderRadius: 14,
        gap: 6
    },

    emptySectionIcon: {
        fontSize: 36,
        marginBottom: 4
    },

    emptySectionTitle: {
        fontSize: 15,
        fontFamily: 'Inter-Bold'
    },

    emptySectionSubtitle: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
        lineHeight: 20
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
