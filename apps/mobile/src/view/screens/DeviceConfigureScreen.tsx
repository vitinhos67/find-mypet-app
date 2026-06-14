import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';
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
    }, [carregarPets]);

    const navigation = useNavigation();
    const route = useRoute<ConfigureRouteProp>();
    const { collarId } = route.params;

    const { devices, getColeiraById, atualizarColeira, vincularColeiraAoPet, excluirColeira, desvincularColeira } = useDeviceViewModel();
    const { darkMode } = useTheme();
    const theme = darkMode ? Colors.dark : Colors.light;

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
        return <SafeAreaView style={{ backgroundColor: theme.background, flex: 1 }}><Text style={{ color: theme.textPrimary, padding: 20 }}>Coleira não encontrada.</Text></SafeAreaView>;
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
                style={[
                    styles.chip,
                    { backgroundColor: isSelected ? Colors.brand.primaryBlue : theme.background },
                    !isSelected && { borderWidth: 1, borderColor: theme.border }
                ]}
                onPress={() => setComportamento(value)}
            >
                <Text style={[
                    styles.chipText,
                    { color: isSelected ? 'white' : theme.textSecondary, fontFamily: isSelected ? 'Inter-Bold' : 'Inter-Regular' }
                ]}>
                    {label}
                </Text>
            </Pressable>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

                <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn} hitSlop={8}>
                        <Ionicons name="chevron-back" size={22} color={theme.textPrimary} />
                    </Pressable>
                    <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Configurar Hardware</Text>
                    <View style={styles.iconBtn} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.card, { backgroundColor: theme.surface }]}>
                        <Field label="Número de Série / PIN" theme={theme}>
                            <Text style={[styles.serial, { color: theme.textPrimary }]}>{coleiraAtual.serialNumber}</Text>
                        </Field>
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <Field label="Apelido do Dispositivo" theme={theme}>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                value={nome}
                                onChangeText={setNome}
                                placeholderTextColor={theme.textSecondary}
                            />
                        </Field>
                    </View>

                    <View style={[styles.card, { backgroundColor: theme.surface }]}>
                        <Field label="Checar Rede Wi-Fi a cada (Minutos)" theme={theme}>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                keyboardType="numeric"
                                value={intervalo}
                                onChangeText={setIntervalo}
                                placeholderTextColor={theme.textSecondary}
                            />
                        </Field>
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <Field label="Comportamento ao sair da zona Wi-Fi" theme={theme}>
                            <View style={styles.chipContainer}>
                                <OptionChip label="Pegar Local e Dormir" value="PEGAR_LOCAL_E_DORMIR" />
                                <OptionChip label="Perguntar ao Usuário" value="PERGUNTAR" />
                                <OptionChip label="Rastreio Ativo (15s)" value="RASTREIO_ATIVO" />
                                <OptionChip label="Apenas Manual" value="IGNORAR" />
                            </View>
                        </Field>
                    </View>

                    <View style={[styles.card, { backgroundColor: theme.surface }]}>
                        <Field label="Rede Wi-Fi (SSID)" theme={theme}>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                value={wifiSsid}
                                onChangeText={setWifiSsid}
                                placeholderTextColor={theme.textSecondary}
                            />
                        </Field>
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <Field label="Senha do Wi-Fi" theme={theme}>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                value={wifiSenha}
                                onChangeText={setWifiSenha}
                                secureTextEntry
                                placeholderTextColor={theme.textSecondary}
                            />
                        </Field>

                        <Pressable style={styles.btnPrimary} onPress={handleSalvarAlteracoes}>
                            <Text style={styles.btnPrimaryText}>Sincronizar com a Coleira</Text>
                        </Pressable>
                        <View style={{ height: 16 }} />
                    </View>

                    <View style={[styles.card, { backgroundColor: theme.surface, paddingVertical: 10 }]}>
                        <Field label="Vínculo com Pet" theme={theme}>
                            {pets && pets.length > 0 ? (
                                <View>
                                    <Text style={[styles.subInfoText, { color: theme.textSecondary, marginBottom: 12 }]}>
                                        Selecione o pet para usar esta coleira:
                                    </Text>
                                    <View style={styles.chipContainer}>
                                        {pets.map(pet => {
                                            const isVinculado = coleiraAtual.petId === pet.id;

                                            const deviceDoPet = devices.find(d => d.petId === pet.id);
                                            const isVinculadoOutra = deviceDoPet && deviceDoPet.id !== collarId;
                                            let bgColor = theme.background;
                                            let borderColor = theme.border;
                                            let textColor = theme.textSecondary;
                                            let fontFam = 'Inter-Regular';

                                            if (isVinculado) {
                                                bgColor = Colors.brand.primaryBlue;
                                                borderColor = Colors.brand.primaryBlue;
                                                textColor = 'white';
                                                fontFam = 'Inter-Bold';
                                            } else if (isVinculadoOutra) {
                                                bgColor = Colors.brand.secondaryOrange;
                                                borderColor = Colors.brand.primaryOrange;
                                                textColor = "white";
                                                fontFam = 'Inter-Medium';
                                            }
                                            const handlePetPress = () => {
                                                if (isVinculado) return;

                                                if (isVinculadoOutra) {
                                                    Alert.alert(
                                                        "Transferir Coleira",
                                                        `O pet ${pet.nome} já está usando o dispositivo "${deviceDoPet.nome}". Deseja remover o vínculo antigo e transferi-lo para esta coleira?`,
                                                        [
                                                            { text: "Cancelar", style: "cancel" },
                                                            { text: "Sim, transferir", onPress: () => vincularColeiraAoPet(collarId, pet.id) }
                                                        ]
                                                    );
                                                } else {
                                                    vincularColeiraAoPet(collarId, pet.id);
                                                }
                                            };

                                            return (
                                                <Pressable
                                                    key={pet.id}
                                                    style={[
                                                        styles.chip,
                                                        { backgroundColor: bgColor, borderColor: borderColor, borderWidth: 1 }
                                                    ]}
                                                    onPress={handlePetPress}
                                                >
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>

                                                        {isVinculado && (
                                                            <Ionicons name="checkmark-circle" size={14} color={textColor} />
                                                        )}
                                                        {isVinculadoOutra && (
                                                            <Ionicons name="hardware-chip-outline" size={14} color={textColor} />
                                                        )}
                                                        <Text style={[styles.chipText, { color: textColor, fontFamily: fontFam }]}>
                                                            {pet.nome || 'Sem nome'}
                                                        </Text>
                                                    </View>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                    {coleiraAtual.petId && (
                                        <Pressable style={styles.btnDesvincular} onPress={() => desvincularColeira(collarId)}>
                                            <Text style={styles.btnDesvincularText}>Desvincular Pet Atual</Text>
                                        </Pressable>
                                    )}
                                </View>
                            ) : (
                                <View>
                                    <Text style={[styles.infoText, { color: theme.textPrimary }]}>Você ainda não possui Pets cadastrados.</Text>
                                    <Text style={[styles.subInfoText, { color: theme.textSecondary }]}>Vá à aba {'"'}Pets{'"'} para adicionar um animal antes de vinculá-lo.</Text>
                                </View>
                            )}
                        </Field>
                    </View>

                    <Pressable style={styles.btnExcluir} onPress={handleExcluir}>
                        <Ionicons name="trash-outline" size={18} color="#DC2626" />
                        <Text style={styles.btnExcluirText}>Excluir Coleira do App</Text>
                    </Pressable>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function Field({ label, children, theme }: { label: string; children: React.ReactNode; theme: any }) {
    return (
        <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1 
    },
    header: {
        height: 56,
        paddingHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 17,
        fontFamily: 'Inter-Bold',
        letterSpacing: -0.2,
    },
    iconBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 48,
        gap: 16,
    },
    card: {
        borderRadius: 18,
        paddingHorizontal: 18,
        overflow: 'hidden',
    },
    fieldWrap: { 
        paddingTop: 14
    },
    divider: { 
        height: 1,
        marginVertical: 4
    },
    label: {
        fontSize: 11,
        fontFamily: 'Inter-Bold',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 8,
    },
    serial: {
        fontSize: 15,
        fontFamily: 'Inter-Regular',
        marginBottom: 4,
    },
    input: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        paddingVertical: 0,
        marginBottom: 10,
    },

    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
        marginBottom: 10,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    chipText: {
        fontSize: 12,
    },
    btnPrimary: {
        backgroundColor: Colors.brand.primaryBlue,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    btnPrimaryText: {
        color: 'white',
        fontSize: 15,
        fontFamily: 'Inter-Bold',
    },
    infoText: {
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'Inter-Bold',
        marginTop: 8,
    },
    subInfoText: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
        marginTop: 6
    },
    btnDesvincular: {
        backgroundColor: '#FEF2F2',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FECACA',
        marginTop: 8,
        marginBottom: 4,
    },
    btnDesvincularText: {
        color: '#DC2626',
        fontFamily: 'Inter-Bold',
        fontSize: 13
    },
    btnExcluir: {
        backgroundColor: '#FEF2F2',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        borderWidth: 1,
        borderColor: '#FECACA',
        marginTop: 10,
    },
    btnExcluirText: {
        color: '#DC2626',
        fontFamily: 'Inter-Bold',
        fontSize: 15
    },
});
