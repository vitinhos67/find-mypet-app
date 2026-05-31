import { DeviceRepository } from "../repositories/device.repository";

export class DeviceService {
    private deviceRepository: DeviceRepository;

    constructor() {
        this.deviceRepository = new DeviceRepository();
    }

    async create(data: any) {
        return await this.deviceRepository.create(data);
    }

    async findManyByOwnerId(ownerId: string) {
        return await this.deviceRepository.findManyByOwnerId(ownerId);
    }

    async update(id: string, ownerId: string, data: any) {
        return await this.deviceRepository.update(id, ownerId, data);
    }

    async delete(id: string, ownerId: string) {
        return await this.deviceRepository.delete(id, ownerId);
    }

    async linkPet(id: string, petId: string | null, ownerId: string) {
        return await this.deviceRepository.updateLink(id, petId, ownerId);
    }
}