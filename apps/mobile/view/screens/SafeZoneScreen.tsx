import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import MapView, { Circle, MapPressEvent, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';
import { SafeZone } from '../../models/safe-zone.model';
import { PetStackParamList } from '../../navigation/types';
import { SafeZoneService } from '../../services/SafeZoneService';
import { Colors } from '../styles/color';

type RouteProps = RouteProp<PetStackParamList, 'SafeZone'>;
type NavProps = NativeStackNavigationProp<PetStackParamList, 'SafeZone'>;

const RADIUS_STEPS = [50, 100, 200, 300, 500, 750, 1000, 1500, 2000, 3000, 5000];

const DEFAULT_LAT = -23.5505;
const DEFAULT_LNG = -46.6333;
const MIN_DELTA = 0.003;

function formatRadius(m: number) {
    return m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`;
}

function safeCoord(lat: unknown, lng: unknown): { latitude: number; longitude: number } {
    const latitude = typeof lat === 'number' && Number.isFinite(lat) ? lat : DEFAULT_LAT;
    const longitude = typeof lng === 'number' && Number.isFinite(lng) ? lng : DEFAULT_LNG;
    return { latitude, longitude };
}

function safeRegion(lat: unknown, lng: unknown, meters: number) {
    const { latitude, longitude } = safeCoord(lat, lng);
    const delta = Math.max((Math.abs(meters) * 6) / 111000, MIN_DELTA);
    return { latitude, longitude, latitudeDelta: delta, longitudeDelta: delta };
}

export default function SafeZoneScreen() {
    const navigation = useNavigation<NavProps>();
    const route = useRoute<RouteProps>();
    const { petId, petNome } = route.params;

    const { darkMode } = useTheme();
    const theme = darkMode ? Colors.dark : Colors.light;
    const mapRef = useRef<MapView>(null);

    const [mapReady, setMapReady] = useState(false);
    const [zone, setZone] = useState<SafeZone | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Monta o MapView só após a tela ganhar foco e desmonta ao perder.
    // Sem o unmount, a instância nativa Android fica com referências nulas
    // ao retornar para a tela, causando crash (react-native-maps #5722).
    useFocusEffect(useCallback(() => {
        const timer = setTimeout(() => setMapReady(true), 350);
        return () => {
            clearTimeout(timer);
            setMapReady(false);
        };
    }, []));

    const [center, setCenter] = useState<{ latitude: number; longitude: number } | null>(null);
    const [radiusIndex, setRadiusIndex] = useState(3); // 300m default
    const [name, setName] = useState('Casa');
    const [isActive, setIsActive] = useState(true);

    const radius = RADIUS_STEPS[radiusIndex];

    useEffect(() => {
        (async () => {
            try {
                const resp: any = await SafeZoneService.get(petId);
                const data: SafeZone | null = resp?.data ?? resp ?? null;
                if (data) {
                    setZone(data);
                    setCenter(safeCoord(data.latitude, data.longitude));
                    setName(data.name ?? 'Casa');
                    setIsActive(data.is_active ?? true);
                    const safeRadius = typeof data.radius_meters === 'number' && data.radius_meters > 0
                        ? data.radius_meters
                        : RADIUS_STEPS[3];
                    const idx = RADIUS_STEPS.findIndex(r => r >= safeRadius);
                    setRadiusIndex(idx >= 0 ? idx : 3);
                    mapRef.current?.animateToRegion(
                        safeRegion(data.latitude, data.longitude, safeRadius),
                        600,
                    );
                }
            } catch { /* sem zona ainda */ }
            finally { setIsLoading(false); }
        })();
    }, [petId]);

    function handleMapPress(e: MapPressEvent) {
        const coord = safeCoord(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude);
        setCenter(coord);
        mapRef.current?.animateToRegion(safeRegion(coord.latitude, coord.longitude, radius), 400);
    }

    async function handleSave() {
        if (!center) { Alert.alert('Atenção', 'Toque no mapa para definir o centro da zona.'); return; }
        setIsSaving(true);
        try {
            await SafeZoneService.upsert(petId, {
                name: name.trim() || 'Casa',
                latitude: center.latitude,
                longitude: center.longitude,
                radius_meters: radius,
                is_active: isActive,
            });
            Alert.alert('Sucesso', 'Zona segura salva!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert('Erro', err?.message || 'Não foi possível salvar.');
        } finally { setIsSaving(false); }
    }

    async function handleDelete() {
        Alert.alert('Remover zona', 'Tem certeza que deseja remover a zona segura?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Remover', style: 'destructive',
                onPress: async () => {
                    try {
                        await SafeZoneService.remove(petId);
                        navigation.goBack();
                    } catch { Alert.alert('Erro', 'Não foi possível remover.'); }
                }
            }
        ]);
    }

    // Quando o mapa monta após o delay de 350ms e os dados já carregaram,
    // o animateToRegion original virou no-op. Este effect corrige isso.
    useEffect(() => {
        if (mapReady && center) {
            mapRef.current?.animateToRegion(safeRegion(center.latitude, center.longitude, radius), 400);
        }
    }, [mapReady]);

    const mapRegion = center
        ? safeRegion(center.latitude, center.longitude, radius)
        : { latitude: DEFAULT_LAT, longitude: DEFAULT_LNG, latitudeDelta: 0.05, longitudeDelta: 0.05 };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn} hitSlop={8}>
                    <Ionicons name="chevron-back" size={22} color={theme.textPrimary} />
                </Pressable>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Zona Segura</Text>
                    <Text style={[styles.headerSub, { color: theme.textSecondary }]}>{petNome}</Text>
                </View>
                {zone && (
                    <Pressable onPress={handleDelete} style={styles.iconBtn} hitSlop={8}>
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </Pressable>
                )}
                {!zone && <View style={styles.iconBtn} />}
            </View>

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.brand.primaryBlue} />
                </View>
            ) : (
                <>
                    {/* Instrução */}
                    {!center && (
                        <View style={[styles.hint, { backgroundColor: Colors.brand.primaryBlue + '12' }]}>
                            <Ionicons name="finger-print-outline" size={16} color={Colors.brand.primaryBlue} />
                            <Text style={[styles.hintText, { color: Colors.brand.primaryBlue }]}>
                                Toque no mapa para definir o centro da zona segura
                            </Text>
                        </View>
                    )}

                    {/* Mapa — só monta após animações de navegação terminarem */}
                    {!mapReady ? (
                        <View style={[styles.map, styles.mapPlaceholder, { backgroundColor: Colors.light.surface }]}>
                            <ActivityIndicator color={Colors.brand.primaryBlue} />
                        </View>
                    ) : (
                        <MapView
                            ref={mapRef}
                            style={styles.map}
                            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                            initialRegion={mapRegion}
                            onPress={handleMapPress}
                            showsMyLocationButton={false}
                            showsCompass={false}
                        >
                            {center && (
                                <>
                                    <Circle
                                        center={center}
                                        radius={radius}
                                        strokeColor={Colors.brand.primaryBlue}
                                        fillColor={Colors.brand.primaryBlue + '22'}
                                        strokeWidth={2}
                                    />
                                    <Marker coordinate={center} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
                                        <View style={styles.centerMarker}>
                                            <View style={[styles.centerDot, { backgroundColor: Colors.brand.primaryBlue }]} />
                                        </View>
                                    </Marker>
                                </>
                            )}
                        </MapView>
                    )}

                    {/* Painel de configuração */}
                    <View style={[styles.panel, { backgroundColor: theme.background }]}>
                        {/* Nome */}
                        <View style={styles.panelRow}>
                            <Text style={[styles.panelLabel, { color: theme.textSecondary }]}>Nome</Text>
                            <TextInput
                                style={[styles.nameInput, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surface }]}
                                value={name}
                                onChangeText={setName}
                                placeholder="Ex: Casa, Trabalho..."
                                placeholderTextColor={theme.textSecondary}
                            />
                        </View>

                        {/* Raio */}
                        <View style={styles.panelRow}>
                            <View style={styles.radiusHeader}>
                                <Text style={[styles.panelLabel, { color: theme.textSecondary }]}>Raio</Text>
                                <View style={[styles.radiusBadge, { backgroundColor: Colors.brand.primaryBlue + '15' }]}>
                                    <Text style={[styles.radiusBadgeText, { color: Colors.brand.primaryBlue }]}>
                                        {formatRadius(radius)}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.radiusSteps}>
                                <Pressable
                                    onPress={() => setRadiusIndex(i => Math.max(0, i - 1))}
                                    style={[styles.stepBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
                                    hitSlop={6}
                                >
                                    <Ionicons name="remove" size={18} color={theme.textPrimary} />
                                </Pressable>

                                <View style={[styles.radiusTrack, { backgroundColor: theme.surface }]}>
                                    <View style={[
                                        styles.radiusFill,
                                        {
                                            width: `${((radiusIndex) / (RADIUS_STEPS.length - 1)) * 100}%`,
                                            backgroundColor: Colors.brand.primaryBlue,
                                        }
                                    ]} />
                                </View>

                                <Pressable
                                    onPress={() => setRadiusIndex(i => Math.min(RADIUS_STEPS.length - 1, i + 1))}
                                    style={[styles.stepBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
                                    hitSlop={6}
                                >
                                    <Ionicons name="add" size={18} color={theme.textPrimary} />
                                </Pressable>
                            </View>
                        </View>

                        {/* Ativo toggle */}
                        <Pressable
                            style={[styles.activeRow, { backgroundColor: theme.surface }]}
                            onPress={() => setIsActive(v => !v)}
                        >
                            <View>
                                <Text style={[styles.activeLabel, { color: theme.textPrimary }]}>Zona ativa</Text>
                                <Text style={[styles.activeSub, { color: theme.textSecondary }]}>
                                    {isActive ? 'Alerta ativado quando pet sair da zona' : 'Alerta desativado'}
                                </Text>
                            </View>
                            <View style={[styles.toggle, { backgroundColor: isActive ? Colors.brand.primaryBlue : theme.border }]}>
                                <View style={[styles.toggleThumb, { transform: [{ translateX: isActive ? 20 : 2 }] }]} />
                            </View>
                        </Pressable>

                        {/* Salvar */}
                        <Pressable
                            style={({ pressed }) => [styles.saveBtn, { opacity: pressed || isSaving ? 0.8 : 1 }]}
                            onPress={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving
                                ? <ActivityIndicator color="#fff" />
                                : <>
                                    <Ionicons name="shield-checkmark-outline" size={18} color="#fff" />
                                    <Text style={styles.saveBtnText}>Salvar Zona Segura</Text>
                                </>
                            }
                        </Pressable>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    header: {
        height: 56,
        paddingHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
    },

    headerCenter: { flex: 1, alignItems: 'center' },

    headerTitle: {
        fontSize: 16,
        fontFamily: 'Inter-Bold',
        letterSpacing: -0.2,
    },

    headerSub: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
    },

    iconBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },

    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    hint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginHorizontal: 16,
        marginTop: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
    },

    hintText: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        flex: 1,
        lineHeight: 18,
    },

    map: { flex: 1, marginTop: 8 },

    mapPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    centerMarker: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(108,144,235,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    centerDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#fff',
    },

    panel: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
        gap: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 8,
    },

    panelRow: { gap: 8 },

    panelLabel: {
        fontSize: 11,
        fontFamily: 'Inter-Bold',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },

    nameInput: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 11,
        fontSize: 15,
        fontFamily: 'Inter-Regular',
    },

    radiusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    radiusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
    },

    radiusBadgeText: {
        fontSize: 13,
        fontFamily: 'Inter-Bold',
    },

    radiusSteps: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    stepBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    radiusTrack: {
        flex: 1,
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },

    radiusFill: {
        height: '100%',
        borderRadius: 4,
    },

    activeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
    },

    activeLabel: {
        fontSize: 14,
        fontFamily: 'Inter-Bold',
    },

    activeSub: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        marginTop: 2,
    },

    toggle: {
        width: 44,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
    },

    toggleThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },

    saveBtn: {
        backgroundColor: Colors.brand.primaryBlue,
        paddingVertical: 15,
        borderRadius: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },

    saveBtnText: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'Inter-Bold',
    },
});
