import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CollarStackParamList } from '../../navigation/types';
import { useDeviceViewModel } from '../../viewmodels/useDeviceViewModel';
import { Colors } from '../styles/color';

type ConfigureRouteProp = RouteProp<CollarStackParamList, 'DeviceConfigure'>;

export default function DeviceConfigureScreen() {
    const navigation = useNavigation();
    const route = useRoute<ConfigureRouteProp>();
    const { collarId } = route.params;

    const { getColeiraById, atualizarColeira, excluirColeira, desvincularColeira } = useDeviceViewModel();

    const coleiraAtual = getColeiraById(collarId);
    const [nome, setNome] = useState('');
    const [wifiSsid, setWifiSsid] = useState('');
    const [wifiSenha, setWifiSenha] = useState('');

    useEffect(() => {
        if (coleiraAtual) {
            setNome(coleiraAtual.nome);
            setWifiSsid(coleiraAtual.wifiSsid);
            setWifiSenha(coleiraAtual.wifiSenha);
        }
    }, [coleiraAtual]);

    if (!coleiraAtual) {
        return <SafeAreaView><Text>Coleira não encontrada.</Text></SafeAreaView>;
    }

    async function handleSalvarAlteracoes() {
        await atualizarColeira(collarId, nome, wifiSsid, wifiSenha);
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.btnVoltar}>
                    <Text style={styles.btnVoltarText}>← Voltar</Text>
                </Pressable>
                <Text style={styles.title}>Configurações</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Detalhes do Dispositivo</Text>
                <Text style={styles.serial}>S/N: {coleiraAtual.serialNumber}</Text>

                <Text style={styles.label}>Apelido</Text>
                <TextInput style={styles.input} value={nome} onChangeText={setNome} />

                <Text style={styles.label}>Rede Wi-Fi (SSID)</Text>
                <TextInput style={styles.input} value={wifiSsid} onChangeText={setWifiSsid} />

                <Text style={styles.label}>Senha do Wi-Fi</Text>
                <TextInput style={styles.input} value={wifiSenha} onChangeText={setWifiSenha} secureTextEntry />

                <Pressable style={styles.btnSalvar} onPress={handleSalvarAlteracoes}>
                    <Text style={styles.btnSalvarText}>Salvar Alterações</Text>
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
                    <Text style={styles.btnExcluirText}>Excluir Coleira</Text>
                </Pressable>

            </ScrollView>
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
    }
});