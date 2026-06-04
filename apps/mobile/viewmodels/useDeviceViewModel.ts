import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { DeviceService } from '../services/DeviceService';

export function useDeviceViewModel() {
    const [devices, setDevices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const carregarColeiras = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await DeviceService.getDevices();

            if (Array.isArray(data)) {
                const devicesFormatados = data.map((dbDevice: any) => ({
                    id: dbDevice.id,
                    nome: dbDevice.name || 'Sem Nome',
                    serialNumber: dbDevice.serial_number,
                    wifiSsid: dbDevice.wifi_ssid,
                    wifiSenha: dbDevice.wifi_password,
                    intervaloAcordarMinutos: dbDevice.wake_interval || 15,
                    comportamentoSemWifi: dbDevice.behavior_no_wifi || 'STORE',
                    petId: dbDevice.pet_id,
                    status: dbDevice.status || 'ONLINE',
                    batteryLevel: dbDevice.battery_level
                }));
                setDevices(devicesFormatados);
            } else {
                setDevices([]);
            }
        } catch (error) {
            console.error('Erro ao buscar coleiras:', error);
            setDevices([]);
        } finally {
            setIsLoading(false);
        }
    }, []);
    async function adicionarNovaColeira(nome: string, serialNumber: string, wifiSsid: string, wifiSenha: string, intervaloAcordarMinutos: number, comportamentoSemWifi: string) {
        setIsLoading(true);
        try {
            await DeviceService.create({
                nome,
                serialNumber,
                wifiSsid,
                wifiSenha,
                intervaloAcordarMinutos,
                comportamentoSemWifi
            });
            await carregarColeiras();
            Alert.alert('Sucesso', 'Coleira registrada na nuvem!');
            return true;
        } catch (error: any) {
            console.log("ERRO COMPLETO:", JSON.stringify(error, null, 2));
            console.log(error?.message)
            const mensagemServidor = error?.message;

            console.log("MENSAGEM EXTRAÍDA:", mensagemServidor);

            Alert.alert('Atenção', mensagemServidor || 'Falha ao registrar coleira.');
            return false;
        } finally {
            setIsLoading(false);
        }
    }

    async function atualizarColeira(id: string, nome: string, wifiSsid: string, wifiSenha: string, intervaloAcordarMinutos: number, comportamentoSemWifi: string) {
        try {
            await DeviceService.update(id, {
                name: nome,
                wifi_ssid: wifiSsid,
                wifi_password: wifiSenha,
                wake_interval: intervaloAcordarMinutos,
                behavior_no_wifi: comportamentoSemWifi
            });
            await carregarColeiras();
            Alert.alert('Sucesso', 'Configurações atualizadas na nuvem!');
            return true;
        } catch (error) {
            console.error('CRASH NA ATUALIZAÇÃO DO FRONTEND:', error);
            Alert.alert('Erro', 'Falha ao atualizar a coleira.');
            return false;
        }
    }

    async function vincularColeiraAoPet(collarId: string, petId: string | null) {
        try {
            await DeviceService.linkPet(collarId, petId);
            await carregarColeiras();
            Alert.alert('Sucesso', petId ? 'Coleira vinculada ao Pet!' : 'Coleira desvinculada com sucesso.');
            return true;
        } catch (error) {
            Alert.alert('Erro', 'Falha ao alterar o vínculo da coleira.');
            return false;
        }
    }

    async function desvincularColeira(collarId: string) {
        return await vincularColeiraAoPet(collarId, null);
    }

    async function excluirColeira(id: string) {
        try {
            await DeviceService.delete(id);
            await carregarColeiras();
            Alert.alert('Sucesso', 'Dispositivo removido da sua conta.');
            return true;
        } catch (error) {
            Alert.alert('Erro', 'Falha ao excluir a coleira.');
            return false;
        }
    }

    function getColeiraById(id: string) {
        return devices.find(d => d.id === id);
    }

    useEffect(() => {
        carregarColeiras();
    }, [carregarColeiras]);

    return {
        devices,
        isLoading,
        carregarColeiras,
        adicionarNovaColeira,
        atualizarColeira,
        excluirColeira,
        vincularColeiraAoPet,
        desvincularColeira,
        getColeiraById
    };
}