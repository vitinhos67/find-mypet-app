import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
export type ComportamentoSemWifi = 'PERGUNTAR' | 'RASTREIO_ATIVO' | 'PEGAR_LOCAL_E_DORMIR' | 'IGNORAR';
export interface CollarDevice {
    id: string;
    nome: string;       
    serialNumber: string;
    wifiSsid: string;   
    wifiSenha: string;  
    petId: string | null;
    status: 'ONLINE' | 'OFFLINE';
    intervaloAcordarMinutos: number;
    comportamentoSemWifi: ComportamentoSemWifi;
}

let fakeDatabase: CollarDevice[] = [];

export function useDeviceViewModel() {
    const [devices, setDevices] = useState<CollarDevice[]>([]);

    const carregarColeiras = useCallback(() => {
        setDevices([...fakeDatabase]);
    }, []);
    async function adicionarNovaColeira(nome: string, serialNumber: string, wifiSsid: string, wifiSenha: string, intervaloAcordarMinutos: number, comportamentoSemWifi: ComportamentoSemWifi) {
        if (!nome.trim() || !serialNumber.trim()) {
            Alert.alert('Erro', 'Nome e Serial são obrigatórios.');
            return false;
        }

        const novaColeira: CollarDevice = {
            id: Math.random().toString(36).substring(7),
            nome,
            serialNumber,
            wifiSsid,
            wifiSenha,
            petId: null,
            status: 'ONLINE',
            intervaloAcordarMinutos,
            comportamentoSemWifi
        };

        fakeDatabase.push(novaColeira);
        carregarColeiras();
        Alert.alert('Sucesso', 'Coleira registrada com sucesso!');
        return true;
    }
    async function atualizarColeira(id: string, nome: string, wifiSsid: string, wifiSenha: string, intervaloAcordarMinutos: number, comportamentoSemWifi: ComportamentoSemWifi) {
        fakeDatabase = fakeDatabase.map(device =>
            device.id === id ? {...device, nome, wifiSsid, wifiSenha, intervaloAcordarMinutos, comportamentoSemWifi} : device
        );
        carregarColeiras();
        Alert.alert('Sucesso', 'Configurações atualizadas e enviadas ao dispositivo!');
        return true;
    }
    async function excluirColeira(id: string) {
        fakeDatabase = fakeDatabase.filter(device => device.id !== id);
        carregarColeiras();
        Alert.alert('Sucesso', 'Dispositivo removido da sua conta.');
        return true;
    }

    async function vincularColeiraAoPet(collarId: string, petId: string) {
        fakeDatabase = fakeDatabase.map(device =>
            device.id === collarId ? { ...device, petId } : device
        );
        carregarColeiras();
        Alert.alert('Sucesso', 'Coleira vinculada ao Pet!');
        return true;
    }

    async function desvincularColeira(collarId: string) {
        fakeDatabase = fakeDatabase.map(device =>
            device.id === collarId ? { ...device, petId: null } : device
        );
        carregarColeiras();
        Alert.alert('Sucesso', 'Coleira desvinculada.');
        return true;
    }

    function getColeiraById(id: string) {
        return fakeDatabase.find(d => d.id === id);
    }

    return {
        devices,
        carregarColeiras,
        adicionarNovaColeira,
        atualizarColeira,
        excluirColeira,
        vincularColeiraAoPet,
        desvincularColeira,
        getColeiraById
    };
}