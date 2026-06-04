export type ComportamentoSemWifi = 'PERGUNTAR' | 'RASTREIO_ATIVO' | 'PEGAR_LOCAL_E_DORMIR' | 'IGNORAR';

export interface CollarDevice {
    id: string;
    nome: string;
    serialNumber: string;
    wifiSsid: string;
    wifiSenha: string;
    petId: string | null;
    status: 'ONLINE' | 'OFFLINE';
    batteryLevel?: number | null;
    intervaloAcordarMinutos: number;
    comportamentoSemWifi: ComportamentoSemWifi;
    
}

export interface DevicePayload {
    nome: string;
    serialNumber: string;
    wifiSsid: string;
    wifiSenha: string;
    intervaloAcordarMinutos: number;
    comportamentoSemWifi: string;
}

export interface DeviceResponse {
    id: string;
    owner_id: string;
    nome: string;
    serial_number: string;
    wifi_ssid: string;
    wifi_senha: string;
    intervalo_acordar_minutos: number;
    battery_level?: number | null;
    comportamento_sem_wifi: string;
    status: string;
    created_at: string;
}
export interface Device {
    id: string;
    serial_number: string;
    name: string;
    wifi_ssid: string;
    wifi_password: string;
    pet_id: string | null;
    status: 'ONLINE' | 'OFFLINE';
    battery_level?: number | null;
    wake_interval: number;
    behavior_no_wifi: 'STORE' | 'DISCARD';
    owner_id: string;
}
//