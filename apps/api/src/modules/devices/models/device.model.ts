export interface Device {
    id: string;
    serial_number: string;
    name: string;
    wifi_ssid?: string;
    wifi_password?: string;
    pet_id?: string | null;
    status: 'ONLINE' | 'OFFLINE';
    wake_interval: number;
    behavior_no_wifi: string;
    owner_id: string;
    created_at: string;
}