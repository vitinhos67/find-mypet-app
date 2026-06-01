import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    Image,
    Linking,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';
import { PetStackParamList } from '../../navigation/types';
import { useLocationViewModel } from '../../viewmodels/useLocationViewModel';
import { usePetViewModel } from '../../viewmodels/usePetViewModel';
import { Colors } from '../styles/color';

type RouteProps = RouteProp<PetStackParamList, 'PetProfile'>;
type NavProps = NativeStackNavigationProp<PetStackParamList, 'PetProfile'>;

export default function PetProfileScreen() {
    const navigation = useNavigation<NavProps>();
    const route = useRoute<RouteProps>();
    const { petId } = route.params;

    const { getPetById, carregarPets, isLoading } = usePetViewModel();
    const { localizacao, isLoading: isLoadingLocation } = useLocationViewModel(petId);

    const { darkMode } = useTheme();
    const theme = darkMode ? Colors.dark : Colors.light;

    useEffect(() => { carregarPets(); }, [carregarPets]);

    const pet = getPetById(petId);

    const isOwner = !pet?.isShared;
    const canEdit = !pet?.isShared || pet?.sharePermission === 'EDIT';

    function abrirNoMapa() {
        if (!localizacao) return;
        const { latitude, longitude } = localizacao;
        const label = pet?.nome ?? 'Pet';
        const url = Platform.select({
            ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
            android: `geo:0,0?q=${latitude},${longitude}(${label})`
        });
        if (url) Linking.openURL(url);
    }

    function formatarData(iso: string) {
        try {
            return new Date(iso).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch { return iso; }
    }

    if (isLoading && !pet) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.brand.primaryBlue} />
                </View>
            </SafeAreaView>
        );
    }

    if (!pet) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.centered}>
                    <Text style={[styles.notFound, { color: theme.textSecondary }]}>Pet não encontrado.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const isMacho = pet.sexo === 'MACHO';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn} hitSlop={8}>
                    <Ionicons name="chevron-back" size={22} color={theme.textPrimary} />
                </Pressable>

                <Text style={[styles.headerTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                    {pet.nome}
                </Text>

                <View style={styles.headerActions}>
                    {isOwner && (
                        <Pressable
                            style={styles.iconBtn}
                            onPress={() => navigation.navigate('PetShare', { petId, petNome: pet.nome })}
                            hitSlop={8}
                        >
                            <Ionicons name="person-add-outline" size={20} color={Colors.brand.primaryBlue} />
                        </Pressable>
                    )}
                    {canEdit && (
                        <Pressable
                            style={styles.iconBtn}
                            onPress={() => navigation.navigate('PetDetails', { petId })}
                            hitSlop={8}
                        >
                            <Ionicons name="create-outline" size={20} color={Colors.brand.primaryOrange} />
                        </Pressable>
                    )}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <View style={styles.hero}>
                    {pet.foto ? (
                        <Image source={{ uri: pet.foto }} style={styles.heroPhoto} />
                    ) : (
                        <View style={[styles.heroPlaceholder, { backgroundColor: Colors.brand.primaryBlue + '15' }]}>
                            <Text style={styles.heroEmoji}>🐾</Text>
                        </View>
                    )}
                    <Text style={[styles.heroName, { color: theme.textPrimary }]}>{pet.nome}</Text>
                    <View style={styles.heroMeta}>
                        {!!pet.raca && (
                            <Text style={[styles.heroBreed, { color: theme.textSecondary }]}>{pet.raca}</Text>
                        )}
                        <View style={[styles.sexPill, { backgroundColor: isMacho ? '#EEF3FF' : '#FFF0F7' }]}>
                            <Text style={[styles.sexPillText, { color: isMacho ? Colors.brand.primaryBlue : '#E879A8' }]}>
                                {isMacho ? '♂ Macho' : '♀ Fêmea'}
                            </Text>
                        </View>
                    </View>
                    {pet.isShared && (
                        <View style={[styles.sharedBadge, { backgroundColor: Colors.brand.primaryOrange + '18' }]}>
                            <Ionicons name="people-outline" size={13} color={Colors.brand.primaryOrange} />
                            <Text style={[styles.sharedBadgeText, { color: Colors.brand.primaryOrange }]}>
                                {pet.sharePermission === 'EDIT' ? 'Compartilhado · Pode editar' : 'Compartilhado · Visualização'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={[styles.card, { backgroundColor: theme.surface }]}>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Cor</Text>
                        <Text style={[styles.infoValue, { color: theme.textPrimary }]}>{pet.cor || '—'}</Text>
                    </View>
                    {!!pet.descricao && (
                        <>
                            <View style={[styles.divider, { backgroundColor: theme.border }]} />
                            <View style={styles.descRow}>
                                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Descrição</Text>
                                <Text style={[styles.descText, { color: theme.textPrimary }]}>{pet.descricao}</Text>
                            </View>
                        </>
                    )}
                </View>

                {/* Localização */}
                <View style={[styles.card, { backgroundColor: theme.surface }]}>
                    <View style={styles.locHeader}>
                        <Text style={[styles.locTitle, { color: theme.textPrimary }]}>Última Localização</Text>
                        {localizacao && (
                            <Pressable onPress={abrirNoMapa} hitSlop={8}>
                                <Text style={[styles.locAction, { color: Colors.brand.primaryBlue }]}>Abrir no mapa</Text>
                            </Pressable>
                        )}
                    </View>

                    {isLoadingLocation ? (
                        <View style={styles.mapBox}>
                            <ActivityIndicator color={Colors.brand.primaryBlue} />
                        </View>
                    ) : localizacao ? (
                        <>
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: localizacao.latitude,
                                    longitude: localizacao.longitude,
                                    latitudeDelta: 0.008,
                                    longitudeDelta: 0.008
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                                pitchEnabled={false}
                                rotateEnabled={false}
                            >
                                <Marker
                                    coordinate={{ latitude: localizacao.latitude, longitude: localizacao.longitude }}
                                    title={pet.nome}
                                    description={pet.raca}
                                    pinColor={Colors.brand.primaryOrange}
                                />
                            </MapView>
                            <View style={styles.locMeta}>
                                <Text style={[styles.locTime, { color: theme.textSecondary }]}>
                                    Atualizado em {formatarData(localizacao.updatedAt)}
                                </Text>
                                {localizacao.precision != null && (
                                    <Text style={[styles.locTime, { color: theme.textSecondary }]}>
                                        ±{localizacao.precision}m
                                    </Text>
                                )}
                            </View>
                        </>
                    ) : (
                        <View style={styles.mapBox}>
                            <Ionicons name="location-outline" size={36} color={theme.border} />
                            <Text style={[styles.mapEmptyTitle, { color: theme.textPrimary }]}>
                                Sem localização registrada
                            </Text>
                            <Text style={[styles.mapEmptySub, { color: theme.textSecondary }]}>
                                Vincule uma coleira ao pet para rastrear sua localização
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    notFound: { fontSize: 15, fontFamily: 'Inter-Regular' },

    header: {
        height: 56,
        paddingHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
    },

    headerTitle: {
        fontSize: 17,
        fontFamily: 'Inter-Bold',
        flex: 1,
        textAlign: 'center',
        letterSpacing: -0.2,
    },

    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    iconBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },

    content: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 40,
        gap: 12,
    },

    hero: {
        alignItems: 'center',
        paddingVertical: 20,
        gap: 10,
    },

    heroPhoto: {
        width: 100,
        height: 100,
        borderRadius: 28,
        marginBottom: 4,
    },

    heroPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },

    heroEmoji: { fontSize: 42 },

    heroName: {
        fontSize: 24,
        fontFamily: 'Inter-Bold',
        letterSpacing: -0.5,
    },

    heroMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    heroBreed: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
    },

    sexPill: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },

    sexPillText: {
        fontSize: 13,
        fontFamily: 'Inter-Bold',
    },

    sharedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },

    sharedBadgeText: {
        fontSize: 12,
        fontFamily: 'Inter-Bold',
    },

    card: {
        borderRadius: 18,
        overflow: 'hidden',
    },

    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 16,
    },

    infoLabel: {
        fontSize: 14,
        fontFamily: 'Inter-Bold',
    },

    infoValue: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
    },

    divider: { height: 1, marginHorizontal: 18 },

    descRow: {
        paddingHorizontal: 18,
        paddingVertical: 16,
        gap: 6,
    },

    descText: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        lineHeight: 22,
    },

    locHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 16,
    },

    locTitle: { fontSize: 15, fontFamily: 'Inter-Bold' },

    locAction: { fontSize: 13, fontFamily: 'Inter-Bold' },

    map: { width: '100%', height: 180 },

    locMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 12,
    },

    locTime: { fontSize: 12, fontFamily: 'Inter-Regular' },

    mapBox: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 16,
        gap: 8,
    },

    mapEmptyTitle: { fontSize: 14, fontFamily: 'Inter-Bold', marginTop: 4 },

    mapEmptySub: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
        lineHeight: 20,
    },
});
