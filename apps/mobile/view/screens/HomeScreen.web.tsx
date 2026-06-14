import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import { formatUpdatedAt, useHomeViewModel } from '../../src/viewmodels/useHomeViewModel';
import { Colors } from '../styles/color';

const STATUS_LABEL: Record<string, string> = {
    ONLINE: 'Online',
    OFFLINE: 'Offline',
    SEM_COLEIRA: 'Sem coleira',
};

const STATUS_COLOR: Record<string, string> = {
    ONLINE: '#22c55e',
    OFFLINE: '#94a3b8',
    SEM_COLEIRA: '#e2e8f0',
};

export default function HomeScreen() {
    const { darkMode } = useTheme();
    const { pets, isLoading, carregarPets } = useHomeViewModel();

    useFocusEffect(
        useCallback(() => {
            carregarPets();
        }, [carregarPets])
    );

    return (
        <SafeAreaView
            style={[styles.container, darkMode && styles.containerDark]}
        >
            {/* Header */}
            <View style={[styles.header, darkMode && styles.headerDark]}>
                <View>
                    <Text style={[styles.headerSub, darkMode && { color: Colors.dark.textSecondary }]}>
                        Find My
                    </Text>
                    <Text style={[styles.headerTitle, darkMode && { color: Colors.brand.primaryOrange }]}>
                        PET
                    </Text>
                </View>
                <View style={[styles.countBadge, darkMode && styles.countBadgeDark]}>
                    <Ionicons name="paw" size={13} color={Colors.brand.primaryOrange} />
                    <Text style={[styles.countText, darkMode && { color: Colors.dark.textSecondary }]}>
                        {pets.length} {pets.length === 1 ? 'pet' : 'pets'}
                    </Text>
                </View>
            </View>

            {/* Notice */}
            <View style={[styles.noticeBanner, darkMode && styles.noticeBannerDark]}>
                <Ionicons name="map-outline" size={15} color={Colors.brand.primaryBlue} />
                <Text style={[styles.noticeText, darkMode && { color: Colors.dark.textSecondary }]}>
                    Mapa disponível apenas no app mobile
                </Text>
            </View>

            {/* List */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list}
            >
                <Text style={[styles.sectionTitle, darkMode && { color: Colors.dark.textPrimary }]}>
                    Rastreamento
                </Text>

                {isLoading ? (
                    <View style={styles.loadingRow}>
                        <ActivityIndicator size="small" color={Colors.brand.primaryBlue} />
                        <Text style={[styles.loadingText, darkMode && { color: Colors.dark.textSecondary }]}>
                            Buscando pets...
                        </Text>
                    </View>
                ) : pets.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons
                            name="paw-outline"
                            size={40}
                            color={darkMode ? Colors.dark.textSecondary : Colors.brand.primaryBlue}
                        />
                        <Text style={[styles.emptyText, darkMode && { color: Colors.dark.textSecondary }]}>
                            Nenhum pet cadastrado
                        </Text>
                    </View>
                ) : (
                    pets.map((pet) => {
                        const dotColor = STATUS_COLOR[pet.status] ?? '#94a3b8';
                        const statusLabel = STATUS_LABEL[pet.status] ?? pet.status;

                        return (
                            <View
                                key={pet.id}
                                style={[styles.card, darkMode && styles.cardDark]}
                            >
                                {/* Avatar */}
                                <View
                                    style={[
                                        styles.avatar,
                                        {
                                            backgroundColor:
                                                pet.status === 'ONLINE'
                                                    ? Colors.brand.primaryBlue
                                                    : '#94a3b8',
                                        },
                                    ]}
                                >
                                    <Ionicons name="paw" size={26} color="white" />
                                    <View
                                        style={[styles.statusDot, { backgroundColor: dotColor }]}
                                    />
                                </View>

                                {/* Info */}
                                <View style={styles.cardInfo}>
                                    <Text
                                        style={[styles.petName, darkMode && { color: Colors.dark.textPrimary }]}
                                        numberOfLines={1}
                                    >
                                        {pet.nome}
                                    </Text>

                                    <View style={styles.statusRow}>
                                        <View style={[styles.statusDotInline, { backgroundColor: dotColor }]} />
                                        <Text style={[styles.statusText, { color: dotColor }]}>
                                            {statusLabel}
                                        </Text>
                                    </View>

                                    {pet.nomeColeira && (
                                        <View style={styles.collarRow}>
                                            <Ionicons
                                                name="hardware-chip-outline"
                                                size={12}
                                                color={Colors.brand.primaryBlue}
                                            />
                                            <Text style={styles.collarText} numberOfLines={1}>
                                                {pet.nomeColeira}
                                            </Text>
                                        </View>
                                    )}

                                    <Text
                                        style={[
                                            styles.timeText,
                                            darkMode && { color: Colors.dark.textSecondary },
                                        ]}
                                    >
                                        {pet.ultimaAtualizacao
                                            ? formatUpdatedAt(pet.ultimaAtualizacao)
                                            : 'Sem localização'}
                                    </Text>
                                </View>

                                {/* Location coords */}
                                {pet.latitude != null && (
                                    <View style={[styles.coordBadge, darkMode && styles.coordBadgeDark]}>
                                        <Ionicons
                                            name="location-outline"
                                            size={13}
                                            color={Colors.brand.primaryBlue}
                                        />
                                        <Text style={styles.coordText}>
                                            {pet.latitude.toFixed(4)}, {pet.longitude!.toFixed(4)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    })
                )}
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

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: Colors.light.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    headerDark: {
        backgroundColor: Colors.dark.surface,
        borderBottomColor: Colors.dark.border,
    },
    headerSub: {
        fontSize: 11,
        fontFamily: 'Inter-Regular',
        color: Colors.light.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    headerTitle: {
        fontSize: 26,
        fontFamily: 'Inter-Black',
        color: Colors.brand.primaryBlue,
        letterSpacing: -0.5,
    },
    countBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.light.background,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 14,
    },
    countBadgeDark: {
        backgroundColor: Colors.dark.background,
    },
    countText: {
        fontSize: 13,
        fontFamily: 'Inter-Medium',
        color: Colors.light.textSecondary,
    },

    // Notice
    noticeBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#eff6ff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#bae6fd',
    },
    noticeBannerDark: {
        backgroundColor: '#0f2744',
        borderBottomColor: '#1e3a5f',
    },
    noticeText: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        color: Colors.light.textSecondary,
    },

    // List
    list: {
        padding: 20,
        gap: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Inter-Bold',
        color: Colors.light.textPrimary,
        marginBottom: 6,
    },

    // Loading / Empty
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 20,
    },
    loadingText: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: Colors.light.textSecondary,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    emptyText: {
        fontSize: 15,
        fontFamily: 'Inter-Regular',
        color: Colors.light.textSecondary,
    },

    // Pet Card
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: Colors.light.surface,
        borderRadius: 18,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 2,
    },
    cardDark: {
        backgroundColor: Colors.dark.surface,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
    },
    statusDot: {
        position: 'absolute',
        bottom: 1,
        right: 1,
        width: 13,
        height: 13,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: 'white',
    },
    cardInfo: {
        flex: 1,
        gap: 3,
    },
    petName: {
        fontSize: 15,
        fontFamily: 'Inter-Bold',
        color: Colors.light.textPrimary,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    statusDotInline: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'Inter-Medium',
    },
    collarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    collarText: {
        fontSize: 11,
        fontFamily: 'Inter-Regular',
        color: Colors.brand.primaryBlue,
        flexShrink: 1,
    },
    timeText: {
        fontSize: 11,
        fontFamily: 'Inter-Regular',
        color: Colors.light.textSecondary,
    },

    // Coords badge
    coordBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#eff6ff',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    coordBadgeDark: {
        backgroundColor: '#0f2744',
    },
    coordText: {
        fontSize: 10,
        fontFamily: 'Inter-Regular',
        color: Colors.brand.primaryBlue,
    },
});
