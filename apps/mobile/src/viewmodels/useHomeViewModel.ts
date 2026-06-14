import { useCallback, useRef, useState } from 'react';
import MapView from 'react-native-maps';
import { CollarDevice } from '../models/device.model';
import { Alert, SafeZone } from '../models/safe-zone.model';
import { DeviceService } from '../services/DeviceService';
import { LocationService } from '../services/LocationService';
import { PetService } from '../services/PetService';
import { SafeZoneService } from '../services/SafeZoneService';

export type PetStatus = 'ONLINE' | 'OFFLINE' | 'SEM_COLEIRA';

export type PetHomeType = {
    id: string;
    nome: string;
    foto?: string;
    nomeColeira?: string | null;
    deviceId?: string | null;
    status: PetStatus;
    latitude?: number;
    longitude?: number;
    ultimaAtualizacao?: string;
    batteryLevel?: number | null;
};

type MapRegion = {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
};

const DEFAULT_REGION: MapRegion = {
    latitude: -21.109928279918968,
    longitude: - 42.38187763776989,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
};

export function formatUpdatedAt(dateStr?: string): string {
    if (!dateStr) return 'Localização desconhecida';
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Agora mesmo';
    if (mins < 60) return `Há ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Há ${hours}h`;
    return `Há ${Math.floor(hours / 24)} dias`;
}

export function useHomeViewModel() {
    const [pets, setPets] = useState<PetHomeType[]>([]);
    const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
    const [mapRegion, setMapRegion] = useState<MapRegion>(DEFAULT_REGION);
    const mapRef = useRef<MapView>(null);

    const carregarPets = useCallback(async () => {
        try {
            setIsLoading(true);

            const [petsResponse, devicesResponse] = await Promise.all<any>([
                PetService.getPets(),
                DeviceService.getDevices(),
            ]);

            const petsData = Array.isArray(petsResponse)
                ? petsResponse
                : (petsResponse?.data ?? []);

            const devicesData: CollarDevice[] = Array.isArray(devicesResponse)
                ? devicesResponse
                : (devicesResponse?.data ?? []);

            const petsBase: PetHomeType[] = petsData.map((pet: any) => {
                const device = devicesData.find((d) => d.petId === pet.id);
                const status: PetStatus = device
                    ? (device.status === 'ONLINE' ? 'ONLINE' : 'OFFLINE')
                    : 'SEM_COLEIRA';

                return {
                    id: pet.id,
                    nome: pet.name ?? pet.nome,
                    foto: pet.image_href ?? pet.foto,
                    nomeColeira: device?.nome ?? null,
                    deviceId: device?.id ?? null,
                    status,
                    batteryLevel: device?.batteryLevel ?? null,
                };
            });

            const petsWithLocations = await Promise.all(
                petsBase.map(async (pet) => {
                    const location = await LocationService.getLastLocation(pet.id);
                    if (!location) return pet;
                    return {
                        ...pet,
                        latitude: location.latitude,
                        longitude: location.longitude,
                        ultimaAtualizacao: location.updatedAt,
                    };
                })
            );

            setPets(petsWithLocations);

            // Carrega zonas seguras e alertas em paralelo, sem bloquear o mapa
            const petIds = petsBase.map(p => p.id);
            Promise.all([
                Promise.all(
                    petIds.map(id =>
                        SafeZoneService.get(id)
                            .then((r: any) => r?.data ?? r ?? null)
                            .catch(() => null)
                    )
                ),
                SafeZoneService.getAlerts()
                    .then((r: any) => Array.isArray(r) ? r : (r?.data ?? []))
                    .catch(() => []),
            ]).then(([zones, alertList]) => {
                setSafeZones((zones as (SafeZone | null)[]).filter(Boolean) as SafeZone[]);
                setAlerts(alertList);
            });

            const firstWithCoords = petsWithLocations.find(
                (p) => p.latitude != null && p.longitude != null
            );
            if (firstWithCoords?.latitude != null && firstWithCoords?.longitude != null) {
                setSelectedPetId(firstWithCoords.id);
                setMapRegion({
                    latitude: firstWithCoords.latitude,
                    longitude: firstWithCoords.longitude,
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.04,
                });
            }
        } catch (error) {
            console.error('Erro na Home:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const selectPet = useCallback(
        (petId: string) => {
            setSelectedPetId(petId);
            const pet = pets.find((p) => p.id === petId);
            if (pet?.latitude != null && pet?.longitude != null && mapRef.current) {
                mapRef.current.animateToRegion(
                    {
                        latitude: pet.latitude,
                        longitude: pet.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    },
                    600
                );
            }
        },
        [pets]
    );

    return {
        pets,
        safeZones,
        alerts,
        unreadCount: alerts.filter(a => !a.read_at).length,
        isLoading,
        carregarPets,
        selectedPetId,
        selectedPet: pets.find((p) => p.id === selectedPetId) ?? null,
        selectPet,
        mapRegion,
        mapRef,
        petsComLocalizacao: pets.filter(
            (p) => p.latitude != null && p.longitude != null
        ),
    };
}
