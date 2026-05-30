import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet, Switch, Text, TextInput, View
} from 'react-native';
import { SafeAreaView, } from 'react-native-safe-area-context';
import { AuthStackParams } from '../../navigation/types';
import { useLoginViewModel } from '../../viewmodels/useLoginViewModel';
import { Colors } from "../styles/color";

export default function Login() {
    
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [manterConectado, setManterConectado] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const { realizarLogin, isLoading } = useLoginViewModel();
    function handleEntrar() {
        realizarLogin(email, senha, manterConectado)
    }
    function handleCriarConta() {
        navigation.navigate('Cadastro');
    }
    return(
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                <Text style={styles.title}>Find my PET</Text>
                <Image 
                    source={require("../../assets/images/logo-pet.png")}
                    style={styles.logo} 
                />
                <View style={styles.formContainer}>
                    <Text style={styles.welcomeTitle}>Bem-vindo</Text>
                    <Text style={styles.welcomeSubtitle}>
                        Insira seus dados para acessar
                    </Text>
                    
                        <View style={styles.inputsSection}>
                            <TextInput
                                style={styles.input}
                                placeholder="E-mail"
                                placeholderTextColor="#888888"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />

                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Senha"
                                    placeholderTextColor="#888888"
                                    secureTextEntry={!mostrarSenha}
                                    value={senha}
                                    onChangeText={setSenha}
                                />
                                <Pressable
                                    onPress={() => setMostrarSenha(!mostrarSenha)}
                                    style={styles.eyeIcon}
                                >
                                    <Ionicons
                                        name={mostrarSenha ? 'eye-off' : 'eye'}
                                        size={24}
                                        color="#888888"
                                    />
                                </Pressable>
                            </View>
                        </View>
                    <View style={styles.checkboxContainer}>
                        <Switch
                            value={manterConectado}
                            onValueChange={setManterConectado}
                        />
                        <Text style={styles.checkboxText}>Manter conectado</Text>
                    </View>
                        <Pressable
                            onPress={handleEntrar}
                            style={styles.mainButton}
                        >
                            <Text style={styles.mainButtonText}>
                                {isLoading ? 'Carregando...' : 'Entrar'}
                            </Text>
                        </Pressable>
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Não tem uma conta? </Text>
                        <Pressable onPress={handleCriarConta}>
                            <Text style={styles.footerLink}>Crie uma</Text>
                        </Pressable>
                    </View>
                </View>
                </ScrollView>
            </KeyboardAvoidingView >
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
   container:{
        flex: 1,
        margin: 20,
        justifyContent: 'flex-start',
    }, 
    keyboardContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    title:{
        paddingLeft: 20,
        color: Colors.brand.primaryBlue,
        fontSize: 35,
        fontFamily: 'Inter-Black'
    },
    logo:{
        height: 130,
        resizeMode: 'contain',
        alignSelf: 'center',
        marginTop: 0,
        aspectRatio: 2,
    },
    formContainer:{
        width: '100%',
        backgroundColor: Colors.brand.primaryOrange,
        padding: 20,
        alignSelf: 'center',
        borderRadius: 10
    },
    input: {
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        backgroundColor: Colors.brand.secondaryOrange,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'black', 
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: Colors.brand.secondaryBlue,
        opacity: 0.9,
        marginBottom: 24,
    },
    inputsSection: {
        gap: 16, 
        marginBottom: 24,
    },
    mainButton: {
        backgroundColor: Colors.brand.primaryBlue,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    mainButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8, 
    },
    checkboxText: {
        fontSize: 14,
        color: 'black',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: 'black',
    },
    footerLink: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.brand.primaryBlue,
        textDecorationLine: 'underline',
    },
    passwordInput: {
        flex: 1,
        padding: 15,
        fontSize: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.brand.secondaryOrange,
        borderRadius: 8,
    },
    eyeIcon: {
        padding: 15,
    },
});