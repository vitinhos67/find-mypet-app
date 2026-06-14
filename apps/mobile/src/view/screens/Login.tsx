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
    Switch,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthStackParams } from '../../navigation/types';
import { useLoginViewModel } from '../../viewmodels/useLoginViewModel';
import { Colors } from '../styles/color';

export default function Login() {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [manterConectado, setManterConectado] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const { realizarLogin, isLoading } = useLoginViewModel();

    function handleEntrar() {
        realizarLogin(email, senha, manterConectado);
    }

    return (
        <SafeAreaView
            style={styles.container}
            testID="login-screen"
            accessibilityLabel="login-screen"
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
                    {/* Branding */}
                    <View style={styles.branding}>
                        <Image
                            source={require('../../../assets/images/logo-pet.png')}
                            style={styles.logo}
                        />
                        <Text style={styles.appName}>Find my PET</Text>
                        <Text style={styles.appTagline}>Encontre e proteja quem você ama</Text>
                    </View>

                    {/* Card de login */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Bem-vindo de volta</Text>
                        <Text style={styles.cardSub}>Insira seus dados para acessar</Text>

                        {/* Email */}
                        <View style={styles.fieldWrap}>
                            <Text style={styles.fieldLabel}>E-mail</Text>
                            <View style={styles.inputRow}>
                                <Ionicons name="mail-outline" size={18} color={Colors.light.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    testID="login-email-input"
                                    accessibilityLabel="login-email-input"
                                    style={styles.input}
                                    placeholder="seu@email.com"
                                    placeholderTextColor={Colors.light.textSecondary}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        {/* Senha */}
                        <View style={styles.fieldWrap}>
                            <Text style={styles.fieldLabel}>Senha</Text>
                            <View style={styles.inputRow}>
                                <Ionicons name="lock-closed-outline" size={18} color={Colors.light.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    testID="login-password-input"
                                    accessibilityLabel="login-password-input"
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="Sua senha"
                                    placeholderTextColor={Colors.light.textSecondary}
                                    secureTextEntry={!mostrarSenha}
                                    value={senha}
                                    onChangeText={setSenha}
                                />
                                <Pressable
                                    onPress={() => setMostrarSenha(v => !v)}
                                    style={styles.eyeBtn}
                                    hitSlop={8}
                                >
                                    <Ionicons
                                        name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={Colors.light.textSecondary}
                                    />
                                </Pressable>
                            </View>
                        </View>

                        {/* Manter conectado */}
                        <View style={styles.keepRow}>
                            <Switch
                                value={manterConectado}
                                onValueChange={setManterConectado}
                                trackColor={{ false: Colors.light.border, true: Colors.brand.primaryBlue + '80' }}
                                thumbColor={manterConectado ? Colors.brand.primaryBlue : '#fff'}
                            />
                            <Text style={styles.keepText}>Manter conectado</Text>
                        </View>

                        {/* Botão entrar */}
                        <Pressable
                            testID="login-submit-button"
                            accessibilityLabel="login-submit-button"
                            style={({ pressed }) => [styles.btnPrimary, { opacity: pressed || isLoading ? 0.8 : 1 }]}
                            onPress={handleEntrar}
                            disabled={isLoading}
                        >
                            {isLoading
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={styles.btnPrimaryText}>Entrar</Text>
                            }
                        </Pressable>

                        {/* Rodapé */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Não tem uma conta? </Text>
                            <Pressable
                                testID="login-create-account-button"
                                accessibilityLabel="login-create-account-button"
                                onPress={() => navigation.navigate('Cadastro')}
                                hitSlop={8}
                            >
                                <Text style={styles.footerLink}>Criar conta</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
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
        paddingTop: 20,
        paddingBottom: 40,
        justifyContent: 'center',
        gap: 28,
    },

    branding: {
        alignItems: 'center',
        gap: 6,
    },

    logo: {
        width: 130,
        height: 100,
        resizeMode: 'contain',
    },

    appName: {
        marginTop: -30,
        fontSize: 28,
        fontFamily: 'Inter-Black',
        color: Colors.brand.primaryBlue,
        letterSpacing: -0.5,
    },

    appTagline: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        color: Colors.light.textSecondary,
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

    keepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    keepText: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: Colors.light.textPrimary,
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
