import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';
import { ComportamentoSemWifi } from '../../models/device.model';
import { useDeviceViewModel } from '../../viewmodels/useDeviceViewModel';
import { Colors } from '../styles/color';

export default function DeviceAddScreen() {
    const navigation = useNavigation();
    const { adicionarNovaColeira } = useDeviceViewModel();
    const { darkMode } = useTheme();
    const theme = darkMode ? Colors.dark : Colors.light;

    const [nome, setNome] = useState('');
    const [serial, setSerial] = useState('');
    const [wifiSsid, setWifiSsid] = useState('');
    const [wifiSenha, setWifiSenha] = useState('');
    const [intervalo, setIntervalo] = useState('10');
    const [comportamento, setComportamento] = useState<ComportamentoSemWifi>('PEGAR_LOCAL_E_DORMIR');
    const [isLoading, setIsLoading] = useState(false);

    async function handleSalvar() {
        setIsLoading(true);
        const numIntervalo = parseInt(intervalo) || 10;
        const sucesso = await adicionarNovaColeira(nome, serial, wifiSsid, wifiSenha, numIntervalo, comportamento);
        setIsLoading(false);
        if (sucesso) navigation.goBack();
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
                    <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Nova Coleira</Text>
                    <View style={styles.iconBtn} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.card, { backgroundColor: theme.surface }]}>
                        <Field label="Apelido do Dispositivo" theme={theme}>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                value={nome}
                                onChangeText={setNome}
                                placeholder="Ex: Coleira Laranja"
                                placeholderTextColor={theme.textSecondary}
                            />
                        </Field>
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <Field label="Número de Série / PIN" theme={theme}>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                value={serial}
                                onChangeText={setSerial}
                                autoCapitalize="characters"
                                placeholder="Ex: FMP12ABCD3"
                                placeholderTextColor={theme.textSecondary}
                            />
                        </Field>
                    </View>
                    <View style={[styles.card, { backgroundColor: theme.surface }]}>
                        <Field label="Nome da Rede (SSID)" theme={theme}>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                value={wifiSsid}
                                onChangeText={setWifiSsid}
                                placeholder="Sua rede Wi-Fi"
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
                                placeholder="Senha da rede"
                                placeholderTextColor={theme.textSecondary}
                            />
                        </Field>
                    </View>
                    <View style={[styles.card, { backgroundColor: theme.surface }]}>
                        <Field label="Checar Wi-Fi a cada (Minutos)" theme={theme}>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                keyboardType="numeric"
                                value={intervalo}
                                onChangeText={setIntervalo}
                                placeholder="Ex: 10"
                                placeholderTextColor={theme.textSecondary}
                            />
                        </Field>
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <Field label="Se sair do Wi-Fi (Modo Rua)" theme={theme}>
                            <View style={styles.chipContainer}>
                                <OptionChip label="Pegar Local e Dormir" value="PEGAR_LOCAL_E_DORMIR" />
                                <OptionChip label="Perguntar" value="PERGUNTAR" />
                                <OptionChip label="Rastreio Ativo" value="RASTREIO_ATIVO" />
                                <OptionChip label="Apenas Manual" value="IGNORAR" />
                            </View>
                        </Field>
                    </View>
                    <Pressable
                        style={({ pressed }) => [
                            styles.btnPrimary,
                            isLoading && { opacity: 0.65 },
                            { opacity: pressed && !isLoading ? 0.85 : undefined }
                        ]}
                        onPress={handleSalvar}
                        disabled={isLoading}
                    >
                        {isLoading
                            ? <ActivityIndicator color="white" />
                            : <Text style={styles.btnPrimaryText}>Registrar Dispositivo</Text>
                        }
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
        gap: 12,
    },
    card: {
        borderRadius: 18,
        paddingHorizontal: 18,
        overflow: 'hidden',
    },
    fieldWrap: { 
        paddingVertical: 14 
    },
    divider: { 
        height: 1 
    },
    label: {
        fontSize: 11,
        fontFamily: 'Inter-Bold',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 8,
    },
    input: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        paddingVertical: 0,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
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
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 4,
    },
    btnPrimaryText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Inter-Bold',
    },
});