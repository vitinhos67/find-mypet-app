import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import { Pet } from '../../src/models/pet.model';
import { PetStackParamList } from '../../src/navigation/types';
import { usePetViewModel } from '../../src/viewmodels/usePetViewModel';
import { Colors } from '../styles/color';

type NavigationProp = NativeStackNavigationProp<PetStackParamList, 'PetList'>;

function PetCard({ item, onPress, theme, onImagePress }: { item: Pet; onPress: () => void; theme: any; onImagePress: (uri: string) => void; }) {
    const isMacho = item.sexo === 'MACHO';
    return (
        <Pressable
            style={({ pressed }) => [styles.card, { backgroundColor: theme.surface, opacity: pressed ? 0.88 : 1 }]}
            onPress={onPress}
        >
            {item.foto ? (
                <Pressable
                    onPress={(e) => { e.stopPropagation(); onImagePress(item.foto!); }}
                >
                    <Image
                        source={{ uri: item.foto }}
                        style={styles.avatar}
                    />
                </Pressable>
            ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: Colors.brand.primaryBlue + '15' }]}>
                    <Text style={styles.avatarEmoji}>🐾</Text>
                </View>
            )}

            <View style={styles.cardBody}>
                <Text style={[styles.cardName, { color: theme.textPrimary }]}>{item.nome}</Text>
                <Text style={[styles.cardBreed, { color: theme.textSecondary }]} numberOfLines={1}>
                    {item.raca || 'Raça não informada'}
                </Text>
                {item.isShared && item.sharePermission && (
                    <View style={[
                        styles.permTag,
                        { backgroundColor: item.sharePermission === 'EDIT' ? '#FFF4E8' : '#EEF3FF' }
                    ]}>
                        <Text style={[
                            styles.permTagText,
                            { color: item.sharePermission === 'EDIT' ? Colors.brand.primaryOrange : Colors.brand.primaryBlue }
                        ]}>
                            {item.sharePermission === 'EDIT' ? 'Pode editar' : 'Visualização'}
                        </Text>
                    </View>
                )}
            </View>

            <View style={[styles.sexBadge, { backgroundColor: isMacho ? '#EEF3FF' : '#FFF0F7' }]}>
                <Text style={[styles.sexIcon, { color: isMacho ? Colors.brand.primaryBlue : '#E879A8' }]}>
                    {isMacho ? '♂' : '♀'}
                </Text>
            </View>
        </Pressable>
    );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
    const { darkMode } = useTheme();
    const theme = darkMode ? Colors.dark : Colors.light;
    return (
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>
            {count > 0 && (
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{count}</Text>
                </View>
            )}
        </View>
    );
}

function EmptySection({ icon, message }: { icon: string; message: string }) {
    const { darkMode } = useTheme();
    const theme = darkMode ? Colors.dark : Colors.light;
    return (
        <View style={[styles.emptyBox, { backgroundColor: theme.surface }]}>
            <Text style={styles.emptyIcon}>{icon}</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{message}</Text>
        </View>
    );
}

export default function PetListScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { pets, sharedPets, isLoading, carregarPets } = usePetViewModel();
    const { darkMode } = useTheme();
    const theme = darkMode ? Colors.dark : Colors.light;
    const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useFocusEffect(useCallback(() => { carregarPets(); }, [carregarPets]));

    const loading = isLoading && pets.length === 0 && sharedPets.length === 0;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                <View>
                    <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Pets</Text>
                    <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
                        {pets.length + sharedPets.length === 0
                            ? 'Nenhum pet cadastrado'
                            : `${pets.length + sharedPets.length} ${pets.length + sharedPets.length === 1 ? 'pet' : 'pets'} no total`}
                    </Text>
                </View>
                <Pressable
                    style={({ pressed }) => [styles.collarBtn, { borderColor: theme.border, opacity: pressed ? 0.7 : 1 }]}
                    onPress={() => navigation.navigate('Collar' as any)}
                >
                    <Ionicons name="hardware-chip-outline" size={15} color="white" />
                    <Text style={[styles.collarText]}>Coleiras</Text>
                </Pressable>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.brand.primaryBlue} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Meus Pets */}
                    <SectionHeader title="Meus Pets" count={pets.length} />
                    {pets.length === 0
                        ? <EmptySection icon="🐾" message="Toque em + para cadastrar seu primeiro pet" />
                        : pets.map(item => (
                            <PetCard
                                key={item.id}
                                item={item}
                                theme={theme}
                                onPress={() => navigation.navigate('PetProfile', { petId: item.id })}
                                onImagePress={(uri) => { setImagemSelecionada(uri); setModalVisible(true); }}
                            />
                        ))
                    }

                    {/* Compartilhados comigo */}
                    <SectionHeader title="Compartilhados comigo" count={sharedPets.length} />
                    {sharedPets.length === 0
                        ? <EmptySection icon="🔗" message="Quando alguém compartilhar um pet com você, ele aparecerá aqui" />
                        : sharedPets.map(item => (
                            <PetCard
                                key={item.id}
                                item={item}
                                theme={theme}
                                onPress={() => navigation.navigate('PetProfile', { petId: item.id })}
                                onImagePress={(uri) => { setImagemSelecionada(uri); setModalVisible(true); }}
                            />
                        ))
                    }
                </ScrollView>
            )}
            
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable
                    style={styles.modalContainer}
                    onPress={() => setModalVisible(false)}
                >
                {imagemSelecionada && (
                    <Image
                        source={{ uri: imagemSelecionada }}
                        style={styles.modalImage}
                        resizeMode="contain"
                    />
                )}
                </Pressable>
            </Modal>

            <Pressable
                style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.85 : 1 }]}
                onPress={() => navigation.navigate('PetAdd')}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    header: {
        paddingHorizontal: 24,
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
    },

    headerTitle: {
        fontSize: 26,
        fontFamily: 'Inter-Bold',
        letterSpacing: -0.5,
    },

    headerSub: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        marginTop: 2,
    },

    collarBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.brand.primaryBlue,
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },

    collarText: {
        color: "white",
        fontSize: 13,
        fontFamily: 'Inter-Bold',
    },

    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    scroll: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100,
        gap: 8,
    },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
        marginTop: 4,
    },

    sectionTitle: {
        fontSize: 15,
        fontFamily: 'Inter-Bold',
        letterSpacing: -0.2,
    },

    countBadge: {
        backgroundColor: Colors.brand.primaryBlue + '20',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },

    countText: {
        fontSize: 12,
        fontFamily: 'Inter-Bold',
        color: Colors.brand.primaryBlue,
    },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 16,
        gap: 14,
        marginBottom: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 1,
    },

    avatar: {
        width: 52,
        height: 52,
        borderRadius: 16,
    },

    avatarPlaceholder: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },

    avatarEmoji: { fontSize: 22 },

    cardBody: { flex: 1, gap: 3 },

    cardName: {
        fontSize: 15,
        fontFamily: 'Inter-Bold',
        letterSpacing: -0.2,
    },

    cardBreed: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
    },

    permTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginTop: 2,
    },

    permTagText: {
        fontSize: 11,
        fontFamily: 'Inter-Bold',
    },

    sexBadge: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    sexIcon: { fontSize: 18, fontFamily: 'Inter-Bold' },

    emptyBox: {
        borderRadius: 16,
        paddingVertical: 24,
        paddingHorizontal: 20,
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },

    emptyIcon: { fontSize: 32 },

    emptyText: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
        lineHeight: 20,
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
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    modalImage: {
        width: '95%',
        height: '80%',
    },

});
