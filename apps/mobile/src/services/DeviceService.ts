import { ApiService } from './ApiService';
import { DeviceLocalRepository } from '../database';
import { CollarDevice, ComportamentoSemWifi } from '../models/device.model';
import { AuthService } from './AuthService';

type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
};

type ApiDeviceResponse = {
    id: string;
    name?: string | null;
    nome?: string | null;
    serial_number?: string | null;
    wifi_ssid?: string | null;
    wifi_password?: string | null;
    wifi_senha?: string | null;
    wake_interval?: number | null;
    intervalo_acordar_minutos?: number | null;
    behavior_no_wifi?: string | null;
    comportamento_sem_wifi?: string | null;
    pet_id?: string | null;
    status?: 'ONLINE' | 'OFFLINE' | string | null;
    battery_level?: number | null;
};

export class DeviceService {
    static async getDevices(): Promise<CollarDevice[]> {
        try {
            const response = await ApiService.get<
                ApiResponse<ApiDeviceResponse[]> | ApiDeviceResponse[]
            >('/devices');
            const devices = this.getDevicesData(response)
                .map(device => this.toDeviceCache(device));

            const userId = await AuthService.getCurrentUserId();
            if (userId) {
                await DeviceLocalRepository.replaceAll(userId, devices);
            }

            return devices;
        } catch (error) {
            console.log('Erro ao carregar dispositivos pela API:', error);

            const userId = await AuthService.getCurrentUserId();
            if (!userId) {
                throw error;
            }

            return DeviceLocalRepository.findAll(userId);
        }
    }

    static async create(data: any): Promise<any> {
        return ApiService.post('/devices', data);
    }

    static async update(id: string, data: any): Promise<any> {

        return ApiService.request(`/devices/${id}`, {
            method: 'PUT',
            body: data,
        });
    }

    static async delete(id: string): Promise<any> {
        return ApiService.request(`/devices/${id}`, {
            method: 'DELETE',
        });
    }

    static async linkPet(collarId: string, petId: string | null): Promise<any> {
        return ApiService.request(`/devices/${collarId}/link`, {
            method: 'PUT',
            body: { pet_id: petId },
        });
    }

    private static getDevicesData(
        response: ApiResponse<ApiDeviceResponse[]> | ApiDeviceResponse[]
    ) {
        return Array.isArray(response) ? response : response.data || [];
    }

    private static toDeviceCache(device: ApiDeviceResponse): CollarDevice {
        const comportamentoSemWifi = (
            device.behavior_no_wifi ?? device.comportamento_sem_wifi ?? 'STORE'
        ) as ComportamentoSemWifi;

        return {
            id: device.id,
            nome: device.name ?? device.nome ?? 'Sem Nome',
            serialNumber: device.serial_number ?? '',
            wifiSsid: device.wifi_ssid ?? '',
            wifiSenha: device.wifi_password ?? device.wifi_senha ?? '',
            intervaloAcordarMinutos: device.wake_interval ?? device.intervalo_acordar_minutos ?? 15,
            comportamentoSemWifi,
            petId: device.pet_id ?? null,
            status: device.status === 'OFFLINE' ? 'OFFLINE' : 'ONLINE',
            batteryLevel: device.battery_level ?? null
        };
    }
}
