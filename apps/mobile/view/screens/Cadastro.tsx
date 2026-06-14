import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
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

import { AuthStackParams } from '../../src/navigation/types';
import { useCadastroViewModel } from '../../src/viewmodels/useCadastroViewModel';
import { Colors } from '../styles/color';

const GENERO_OPTIONS = ['Masculino', 'Feminino', 'Outro'];

export default function Cadastro() {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [telefone, setTelefone] = useState('');
    const [genero, setGenero] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
    const { realizarCadastro, isLoading } = useCadastroViewModel();

    function handleCadastrar() {
        realizarCadastro(nome, email, senha, confirmarSenha, telefone, genero || 'Gênero');
    }

    return (
        <SafeAreaView
            style={styles.container}
            testID="create-account-screen"
            accessibilityLabel="create-account-screen"
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Pressable onPress={() => navigation.pop()} style={styles.backBtn} hitSlop={8}>
                            <Ionicons name="chevron-back" size={22} color={Colors.light.textPrimary} />
                        </Pressable>
                        <View style={styles.brandingInline}>
                            <Image
                                source={require('../../assets/images/logo-pet.png')}
                                style={styles.logoSmall}
                            />
                            <Text style={styles.appName}>Find my PET</Text>
                        </View>
                        <View style={styles.backBtn} />
                    </View>

                    {/* Card de cadastro */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Criar conta</Text>
                        <Text style={styles.cardSub}>Preencha as informações corretamente</Text>

                        {/* Nome */}
                        <InputField
                            label="Nome completo"
                            icon="person-outline"
                            placeholder="Seu nome"
                            value={nome}
                            onChangeText={setNome}
                        />

                        {/* Email */}
                        <InputField
                            label="E-mail"
                            icon="mail-outline"
                            placeholder="seu@email.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        {/* Telefone */}
                        <InputField
                            label="Telefone"
                            icon="call-outline"
                            placeholder="DDD + 9 números"
                            value={telefone}
                            onChangeText={setTelefone}
                            keyboardType="phone-pad"
                            maxLength={11}
                        />

                        {/* Senha */}
                        <PasswordField
                            label="Senha"
                            placeholder="Mínimo 6 caracteres"
                            value={senha}
                            onChangeText={setSenha}
                            mostrar={mostrarSenha}
                            onToggle={() => setMostrarSenha(v => !v)}
                        />

                        {/* Confirmar senha */}
                        <PasswordField
                            label="Confirmar senha"
                            placeholder="Repita a senha"
                            value={confirmarSenha}
                            onChangeText={setConfirmarSenha}
                            mostrar={mostrarConfirmarSenha}
                            onToggle={() => setMostrarConfirmarSenha(v => !v)}
                        />

                        {/* Gênero */}
                        <View style={styles.fieldWrap}>
                            <Text style={styles.fieldLabel}>Gênero</Text>
                            <View style={styles.genderRow}>
                                {GENERO_OPTIONS.map((opt) => {
                                    const sel = genero === opt;
                                    return (
                                        <Pressable
                                            key={opt}
                                            style={[
                                                styles.genderChip,
                                                sel && styles.genderChipActive
                                            ]}
                                            onPress={() => setGenero(opt)}
                                        >
                                            <Text style={[styles.genderChipText, sel && styles.genderChipTextActive]}>
                                                {opt}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Botão cadastrar */}
                        <Pressable
                            style={({ pressed }) => [styles.btnPrimary, { opacity: pressed || isLoading ? 0.8 : 1 }]}
                            onPress={handleCadastrar}
                            disabled={isLoading}
                        >
                            {isLoading
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={styles.btnPrimaryText}>Criar conta</Text>
                            }
                        </Pressable>

                        {/* Rodapé */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Já tem uma conta? </Text>
                            <Pressable onPress={() => navigation.pop()} hitSlop={8}>
                                <Text style={styles.footerLink}>Fazer login</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function InputField({
    label, icon, placeholder, value, onChangeText,
    keyboardType, autoCapitalize, maxLength
}: {
    label: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    placeholder: string;
    value: string;
    onChangeText: (t: string) => void;
    keyboardType?: any;
    autoCapitalize?: any;
    maxLength?: number;
}) {
    return (
        <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={styles.inputRow}>
                <Ionicons name={icon} size={18} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.light.textSecondary}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={false}
                    maxLength={maxLength}
                />
            </View>
        </View>
    );
}

function PasswordField({
    label, placeholder, value, onChangeText, mostrar, onToggle
}: {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (t: string) => void;
    mostrar: boolean;
    onToggle: () => void;
}) {
    return (
        <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.light.textSecondary}
                    secureTextEntry={!mostrar}
                    value={value}
                    onChangeText={onChangeText}
                />
                <Pressable onPress={onToggle} style={styles.eyeBtn} hitSlop={8}>
                    <Ionicons
                        name={mostrar ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={Colors.light.textSecondary}
                    />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },

    scroll: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 40,
        gap: 20,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    backBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },

    brandingInline: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    logoSmall: {
        width: 52,
        height: 52,
        resizeMode: 'contain',
    },

    appName: {
        fontSize: 18,
        fontFamily: 'Inter-Black',
        color: Colors.brand.primaryBlue,
        letterSpacing: -0.3,
    },

    card: {
        backgroundColor: Colors.light.surface,
        borderRadius: 24,
        padding: 24,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 2,
    },

    cardTitle: {
        fontSize: 22,
        fontFamily: 'Inter-Bold',
        color: Colors.light.textPrimary,
        letterSpacing: -0.4,
    },

    cardSub: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: Colors.light.textSecondary,
        marginTop: -8,
    },

    fieldWrap: { gap: 6 },

    fieldLabel: {
        fontSize: 11,
        fontFamily: 'Inter-Bold',
        color: Colors.light.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },

    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: 14,
        backgroundColor: Colors.light.background,
        paddingHorizontal: 14,
    },

    inputIcon: {
        marginRight: 10,
    },

    input: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'Inter-Regular',
        color: Colors.light.textPrimary,
        paddingVertical: 14,
    },

    eyeBtn: {
        padding: 4,
        marginLeft: 8,
    },

    genderRow: {
        flexDirection: 'row',
        gap: 8,
    },

    genderChip: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.light.border,
        backgroundColor: Colors.light.background,
        alignItems: 'center',
    },

    genderChipActive: {
        backgroundColor: Colors.brand.primaryBlue,
        borderColor: Colors.brand.primaryBlue,
    },

    genderChipText: {
        fontSize: 13,
        fontFamily: 'Inter-Bold',
        color: Colors.light.textSecondary,
    },

    genderChipTextActive: {
        color: '#fff',
    },

    btnPrimary: {
        backgroundColor: Colors.brand.primaryBlue,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 4,
    },

    btnPrimaryText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Inter-Bold',
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    footerText: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: Colors.light.textSecondary,
    },

    footerLink: {
        fontSize: 14,
        fontFamily: 'Inter-Bold',
        color: Colors.brand.primaryBlue,
    },
});
