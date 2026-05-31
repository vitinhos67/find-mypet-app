import { DevicePayload, DeviceResponse } from '../models/device.model';
import { ApiService } from './ApiService';

export class DeviceService {
    static async createDevice(data: DevicePayload) {
        const response = await ApiService.post<DeviceResponse>('/devices', data);
        return response;
    }

    static async getDevices() {
        const response = await ApiService.get<DeviceResponse[]>('/devices');
        return response;
    }
}