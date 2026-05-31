import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ComportamentoSemWifi } from '../../models/device.model';
import { CollarStackParamList } from '../../navigation/types';
import { useDeviceViewModel } from '../../viewmodels/useDeviceViewModel';
import { usePetViewModel } from '../../viewmodels/usePetViewModel';
import { Colors } from '../styles/color';

type ConfigureRouteProp = RouteProp<CollarStackParamList, 'DeviceConfigure'>;

export default function DeviceConfigureScreen() {
    const { pets, carregarPets } = usePetViewModel();
    useEffect(() => {
        carregarPets();
    }, []); 
    const navigation = useNavigation();
    const route = useRoute<ConfigureRouteProp>();
    const { collarId } = route.params;

    const { getColeiraById, atualizarColeira, vincularColeiraAoPet, excluirColeira, desvincularColeira } = useDeviceViewModel();

    const coleiraAtual = getColeiraById(collarId);
    const [nome, setNome] = useState('');
    const [wifiSsid, setWifiSsid] = useState('');
    const [wifiSenha, setWifiSenha] = useState('');
    const [intervalo, setIntervalo] = useState('10');
    const [comportamento, setComportamento] = useState<ComportamentoSemWifi>('PEGAR_LOCAL_E_DORMIR');

    useEffect(() => {
        if (coleiraAtual) {
            setNome(coleiraAtual.nome);
            setWifiSsid(coleiraAtual.wifiSsid);
            setWifiSenha(coleiraAtual.wifiSenha);
            setIntervalo(coleiraAtual.intervaloAcordarMinutos.toString());
            setComportamento(coleiraAtual.comportamentoSemWifi);
        }
    }, [coleiraAtual]);

    if (!coleiraAtual) {
        return <SafeAreaView><Text>Coleira não encontrada.</Text></SafeAreaView>;
    }

    async function handleSalvarAlteracoes() {
        const numIntervalo = parseInt(intervalo) || 10;
        await atualizarColeira(collarId, nome, wifiSsid, wifiSenha, numIntervalo, comportamento);
        navigation.goBack();
    }

    function handleExcluir() {
        Alert.alert(
            "Excluir Dispositivo",
            "Tem certeza? O hardware precisará ser pareado novamente.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Sim, Excluir", style: "destructive", onPress: async () => {
                        await excluirColeira(collarId);
                        navigation.goBack();
                    }
                }
            ]
        );
    }
    function OptionChip({ label, value }: { label: string, value: ComportamentoSemWifi }) {
        const isSelected = comportamento === value;
        return (
            <Pressable
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setComportamento(value)}
            >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{label}</Text>
            </Pressable>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.btnVoltar}>
                    <Text style={styles.btnVoltarText}>← Voltar</Text>
                </Pressable>
                <Text style={styles.title}>Configurar Hardware</Text>
            </View>
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.sectionTitle}>Detalhes do Dispositivo</Text>
                    <Text style={styles.serial}>S/N: {coleiraAtual.serialNumber}</Text>

                    <Text style={styles.label}>Apelido</Text>
                    <TextInput style={styles.input} value={nome} onChangeText={setNome} />

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Parâmetros de Operação (IoT)</Text>

                    <Text style={styles.label}>Checar Rede Wi-Fi a cada (Minutos)</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={intervalo}
                        onChangeText={setIntervalo}
                    />

                    <Text style={styles.label}>Comportamento ao sair da zona Wi-Fi:</Text>
                    <View style={styles.chipContainer}>
                        <OptionChip label="Pegar Local e Dormir" value="PEGAR_LOCAL_E_DORMIR" />
                        <OptionChip label="Perguntar ao Usuário" value="PERGUNTAR" />
                        <OptionChip label="Rastreio Ativo (15s)" value="RASTREIO_ATIVO" />
                        <OptionChip label="Apenas Manual" value="IGNORAR" />
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Rede Wi-Fi (Modo AP)</Text>
                    <Text style={styles.label}>Rede Wi-Fi (SSID)</Text>
                    <TextInput style={styles.input} value={wifiSsid} onChangeText={setWifiSsid} />

                    <Text style={styles.label}>Senha do Wi-Fi</Text>
                    <TextInput style={styles.input} value={wifiSenha} onChangeText={setWifiSenha} secureTextEntry />

                    <Pressable style={styles.btnSalvar} onPress={handleSalvarAlteracoes}>
                        <Text style={styles.btnSalvarText}>Sincronizar com a Coleira</Text>
                    </Pressable>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Vínculo com Pet</Text>
                    {coleiraAtual.petId ? (
                        <View style={styles.actionBox}>
                            <Text style={styles.infoText}>Protegendo o Pet: {coleiraAtual.petId}</Text>
                            <Pressable style={styles.btnDesvincular} onPress={() => desvincularColeira(collarId)}>
                                <Text style={styles.btnText}>Desvincular</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View style={styles.actionBox}>
                            <Text style={styles.infoText}>Você ainda não possui nenhum Pet cadastrado no seu perfil.</Text>
                            <Text style={styles.subInfoText}>Vá na aba "Perfil" para adicionar um animal antes de vinculá-lo à coleira.</Text>
                        </View>
                    )}

                    <View style={styles.divider} />
                    <Pressable style={styles.btnExcluir} onPress={handleExcluir}>
                        <Text style={styles.btnExcluirText}>Excluir Coleira do App</Text>
                    </Pressable>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: Colors.light.background 
    },
    header: { 
        padding: 20, 
        backgroundColor: 'white', 
        borderBottomWidth: 1, 
        borderColor: '#e2e8f0', 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 15 
    },
    btnVoltar: { 
        padding: 5 
    },
    btnVoltarText: { 
        color: Colors.brand.primaryBlue, 
        fontFamily: 'Inter-Bold',
        fontSize: 16 
    },
    title: { 
        fontSize: 20, 
        fontFamily: 'Inter-Bold',
        color: '#1e293b' 
    },
    content: { 
        padding: 20, 
        paddingBottom: 40
    },
    sectionTitle: { 
        fontSize: 18, 
        fontFamily: 'Inter-Bold',
        color: Colors.brand.primaryOrange, 
        marginBottom: 15 
    },
    keyboardContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 40,
    },
    serial: { 
        fontSize: 14, 
        color: '#64748b', 
        marginBottom: 15, 
        fontFamily: 'Inter-Bold',
    },
    label: { 
        fontSize: 14,
        fontFamily: 'Inter-Bold',
        color: '#334155', 
        marginBottom: 8
     },
    input: { 
        backgroundColor: Colors.light.surface, 
        borderWidth: 1, 
        borderColor: '#cbd5e1', 
        fontFamily: 'Inter-Regular',
        padding: 15, 
        borderRadius: 8, 
        fontSize: 16, 
        marginBottom: 15 
    },
    divider: { 
        height: 1, 
        backgroundColor: Colors.brand.secondaryOrange, 
        marginVertical: 25 
    },
    btnSalvar: { 
        backgroundColor: Colors.brand.primaryBlue, 
        padding: 15, 
        borderRadius: 8, 
        alignItems: 'center' 
    },
    btnSalvarText: { 
        color: 'white', 
        fontFamily: 'Inter-Bold',
        fontSize: 16 
    },
    actionBox: { 
        backgroundColor: 'white', 
        padding: 20, 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: '#e2e8f0' 
    },
    infoText: { 
        fontSize: 16, 
        color: '#334155', 
        textAlign: 'center', 
        fontFamily: 'Inter-Bold',
    },
    subInfoText: { 
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: '#64748b', 
        textAlign: 'center', 
        marginTop: 10 
    },
    btnDesvincular: { 
        backgroundColor: '#ef4444', 
        padding: 12, 
        borderRadius: 8, 
        alignItems: 'center', 
        marginTop: 15 
    },
    btnExcluir: { 
        backgroundColor: '#fee2e2', 
        padding: 15, 
        borderRadius: 8, 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: '#ef4444' 
    },
    btnExcluirText: { 
        color: '#ef4444', 
        fontFamily: 'Inter-Bold',
        fontSize: 16 
    },
    btnText: { 
        color: 'white', 
        fontFamily: 'Inter-Bold',
        fontSize: 14 
    },
    chipContainer: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15
    },
    chip: {
        backgroundColor: Colors.light.background,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10
    },
    chipSelected: {
        backgroundColor: Colors.brand.primaryBlue,
        borderColor: Colors.brand.primaryBlue
    },
    chipText: {
        fontFamily: 'Inter-Regular',
        color: '#64748b',
        fontSize: 14
    },
    chipTextSelected: {
        fontFamily: 'Inter-Bold',
        color: 'white'
    }
});