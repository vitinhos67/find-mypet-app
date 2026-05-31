import { ApiService } from './ApiService';

export class DeviceService {
    static async getDevices(): Promise<any[]> {

        const response = await ApiService.get<any>('/devices');
        return response?.data || response || [];
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
}