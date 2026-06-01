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

    const { getPetById, carregarPets, isLoading: isLoadingPet } = usePetViewModel();
    const { localizacao, isLoading: isLoadingLocation } = useLocationViewModel(petId);

    const { darkMode } = useTheme();
    const theme = darkMode ? Colors.dark : Colors.light;

    useEffect(() => {
        carregarPets();
    }, [carregarPets]);

    const pet = getPetById(petId);

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
        } catch {
            return iso;
        }
    }

    if (isLoadingPet && !pet) {
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
                    <Text style={[styles.notFoundText, { color: theme.textSecondary }]}>
                        Pet não encontrado.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    const sexoLabel = pet.sexo === 'MACHO' ? 'Macho' : 'Fêmea';
    const sexoCor = pet.sexo === 'MACHO' ? Colors.brand.primaryBlue : '#ec4899';
    const sexoBg = pet.sexo === 'MACHO' ? '#dbeafe' : '#fce7f3';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
                    <Text style={[styles.btnVoltar, { color: Colors.brand.primaryBlue }]}>← Voltar</Text>
                </Pressable>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Perfil do Pet</Text>
                <Pressable
                    onPress={() => navigation.navigate('PetDetails', { petId })}
                    hitSlop={12}
                >
                    <Text style={[styles.btnEditar, { color: Colors.brand.primaryOrange }]}>Editar</Text>
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero */}
                <View style={styles.hero}>
                    {pet.foto ? (
                        <Image source={{ uri: pet.foto }} style={styles.heroPhoto} />
                    ) : (
                        <View style={[styles.heroPhotoPlaceholder, { backgroundColor: theme.border }]}>
                            <Text style={styles.heroPhotoIcon}>🐾</Text>
                        </View>
                    )}
                    <Text style={[styles.heroName, { color: theme.textPrimary }]}>{pet.nome}</Text>
                    <View style={styles.heroMeta}>
                        <Text style={[styles.heroBreed, { color: theme.textSecondary }]}>{pet.raca}</Text>
                        <View style={[styles.sexoBadge, { backgroundColor: sexoBg }]}>
                            <Text style={[styles.sexoBadgeText, { color: sexoCor }]}>{sexoLabel}</Text>
                        </View>
                    </View>
                </View>

                {/* Info rápida: Cor */}
                <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Cor</Text>
                        <Text style={[styles.infoValue, { color: theme.textPrimary }]}>{pet.cor || '—'}</Text>
                    </View>
                    {!!pet.descricao && (
                        <>
                            <View style={[styles.infoSeparator, { backgroundColor: theme.border }]} />
                            <View style={styles.infoRowColumn}>
                                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Descrição</Text>
                                <Text style={[styles.infoDescription, { color: theme.textPrimary }]}>
                                    {pet.descricao}
                                </Text>
                            </View>
                        </>
                    )}
                </View>

                {/* Localização */}
                <View style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                            Última Localização
                        </Text>
                        {localizacao && (
                            <Pressable onPress={abrirNoMapa}>
                                <Text style={[styles.sectionAction, { color: Colors.brand.primaryBlue }]}>
                                    Abrir no mapa
                                </Text>
                            </Pressable>
                        )}
                    </View>

                    {isLoadingLocation ? (
                        <View style={styles.mapPlaceholder}>
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
                                    coordinate={{
                                        latitude: localizacao.latitude,
                                        longitude: localizacao.longitude
                                    }}
                                    title={pet.nome}
                                    description={pet.raca}
                                    pinColor={Colors.brand.primaryOrange}
                                />
                            </MapView>

                            <View style={styles.locationMeta}>
                                <Text style={[styles.locationTime, { color: theme.textSecondary }]}>
                                    Atualizado em {formatarData(localizacao.updatedAt)}
                                </Text>
                                {localizacao.precision != null && (
                                    <Text style={[styles.locationPrecision, { color: theme.textSecondary }]}>
                                        Precisão: ±{localizacao.precision}m
                                    </Text>
                                )}
                            </View>
                        </>
                    ) : (
                        <View style={styles.mapPlaceholder}>
                            <Text style={styles.mapPlaceholderIcon}>🗺️</Text>
                            <Text style={[styles.mapPlaceholderTitle, { color: theme.textPrimary }]}>
                                Sem localização registrada
                            </Text>
                            <Text style={[styles.mapPlaceholderSubtitle, { color: theme.textSecondary }]}>
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
    container: {
        flex: 1
    },

    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    notFoundText: {
        fontFamily: 'Inter-Regular',
        fontSize: 16
    },

    header: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1
    },

    btnVoltar: {
        fontSize: 15,
        fontFamily: 'Inter-Bold',
        width: 60
    },

    headerTitle: {
        fontSize: 18,
        fontFamily: 'Inter-Bold'
    },

    btnEditar: {
        fontSize: 15,
        fontFamily: 'Inter-Bold',
        width: 60,
        textAlign: 'right'
    },

    content: {
        padding: 16,
        gap: 12,
        paddingBottom: 40
    },

    hero: {
        alignItems: 'center',
        paddingVertical: 24
    },

    heroPhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 14
    },

    heroPhotoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14
    },

    heroPhotoIcon: {
        fontSize: 48
    },

    heroName: {
        fontSize: 26,
        fontFamily: 'Inter-Bold',
        marginBottom: 6
    },

    heroMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },

    heroBreed: {
        fontSize: 15,
        fontFamily: 'Inter-Regular'
    },

    sexoBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20
    },

    sexoBadgeText: {
        fontSize: 13,
        fontFamily: 'Inter-Bold'
    },

    infoCard: {
        borderRadius: 14,
        paddingHorizontal: 16,
        overflow: 'hidden'
    },

    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14
    },

    infoRowColumn: {
        paddingVertical: 14
    },

    infoSeparator: {
        height: 1
    },

    infoLabel: {
        fontSize: 14,
        fontFamily: 'Inter-Bold'
    },

    infoValue: {
        fontSize: 14,
        fontFamily: 'Inter-Regular'
    },

    infoDescription: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        lineHeight: 22,
        marginTop: 6
    },

    sectionCard: {
        borderRadius: 14,
        overflow: 'hidden'
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 12
    },

    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Inter-Bold'
    },

    sectionAction: {
        fontSize: 13,
        fontFamily: 'Inter-Bold'
    },

    map: {
        width: '100%',
        height: 200
    },

    locationMeta: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    locationTime: {
        fontSize: 12,
        fontFamily: 'Inter-Regular'
    },

    locationPrecision: {
        fontSize: 12,
        fontFamily: 'Inter-Regular'
    },

    mapPlaceholder: {
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 16,
        gap: 8
    },

    mapPlaceholderIcon: {
        fontSize: 40,
        marginBottom: 4
    },

    mapPlaceholderTitle: {
        fontSize: 15,
        fontFamily: 'Inter-Bold'
    },

    mapPlaceholderSubtitle: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
        lineHeight: 20
    }
});
