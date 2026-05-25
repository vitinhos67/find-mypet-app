import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDeviceViewModel } from '../../viewmodels/useDeviceViewModel';
import { Colors } from '../styles/color';

export default function DeviceAddScreen() {
    const navigation = useNavigation();
    const { adicionarNovaColeira } = useDeviceViewModel();

    const [nome, setNome] = useState('');
    const [serial, setSerial] = useState('');
    const [wifiSsid, setWifiSsid] = useState('');
    const [wifiSenha, setWifiSenha] = useState('');

    async function handleSalvar() {
        const sucesso = await adicionarNovaColeira(nome, serial, wifiSsid, wifiSenha);
        if (sucesso) navigation.goBack();
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.btnVoltar}>
                    <Text style={styles.btnVoltarText}>← Voltar</Text>
                </Pressable>
                <Text style={styles.title}>Nova Coleira</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Identificação</Text>

                <Text style={styles.label}>Apelido do Dispositivo</Text>
                <TextInput style={styles.input} placeholder="Ex: Coleira Laranja" value={nome} onChangeText={setNome} />

                <Text style={styles.label}>Número de Série / PIN</Text>
                <TextInput style={styles.input} placeholder="Ex: KODA-89A1" value={serial} onChangeText={setSerial} autoCapitalize="characters" />

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Configuração de Rede (Opcional)</Text>

                <Text style={styles.label}>Nome da Rede Wi-Fi (SSID)</Text>
                <TextInput style={styles.input} placeholder="Sua rede Wi-Fi" value={wifiSsid} onChangeText={setWifiSsid} />

                <Text style={styles.label}>Senha do Wi-Fi</Text>
                <TextInput style={styles.input} placeholder="Senha da rede" value={wifiSenha} onChangeText={setWifiSenha} secureTextEntry />

                <Pressable style={styles.btnSalvar} onPress={handleSalvar}>
                    <Text style={styles.btnSalvarText}>Registrar Dispositivo</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: Colors.light.background, 
    },
    header: { 
        padding: 20, 
        backgroundColor: 'white', 
        borderBottomWidth: 1,
        borderColor: Colors.brand.primaryBlue, 
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
    label: { 
        fontSize: 14, 
        fontFamily: 'Inter-Bold',
        marginBottom: 8 
    },
    input: { 
        backgroundColor: 'white', 
        borderWidth: 1, 
        borderColor: Colors.light.background, 
        padding: 15, 
        borderRadius: 8, 
        fontSize: 16, 
        marginBottom: 15,
        fontFamily: 'Inter-Regular' 
    },
    divider: {
        height: 1, 
        backgroundColor: Colors.light.background, 
        marginVertical: 20 
    },
    btnSalvar: { 
        backgroundColor: Colors.brand.primaryBlue, 
        padding: 18, 
        borderRadius: 8, 
        alignItems: 'center', 
        marginTop: 10 },
    btnSalvarText: { 
        color: 'white', 
        fontFamily: 'Inter-Bold',
        fontSize: 16 
    }
});