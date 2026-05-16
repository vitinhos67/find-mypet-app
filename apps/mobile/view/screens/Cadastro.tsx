import { useNavigation, } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text, TextInput, View
} from 'react-native';
import { SafeAreaView, } from 'react-native-safe-area-context';
import { AuthStackParams } from '../../navigation/types';
import { useCadastroViewModel } from '../../viewmodels/useCadastroViewModel';
import { Colors } from "../styles/color";

export default function Cadastro() {

    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [telefone, setTelefone] = useState('');
    const [genero, setGenero] = useState('Gênero');
    const [showGeneros, setShowGeneros] = useState(false);
    const opcoesGenero = ['Masculino', 'Feminino', 'Outro'];
    const { realizarCadastro, isLoading } = useCadastroViewModel();
    
    function handleEntrar() {
        realizarCadastro(nome, email, senha, confirmarSenha, telefone, genero);
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
                    <View style={styles.header}>
                        <Text style={styles.title}>Find my PET</Text>
                        <Image 
                            source={require("../../assets/images/logo-pet.png")}
                            style={styles.logo} 
                        />
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.welcomeTitle}>Cadastro</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Preencha as informações corretamente
                        </Text>
                        
                            <View style={styles.inputsSection}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nome completo"
                                    placeholderTextColor="#888888"
                                    value={nome}
                                    onChangeText={setNome}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="E-mail"
                                    placeholderTextColor="#888888"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Senha"
                                    placeholderTextColor="#888888"
                                    secureTextEntry
                                    value={senha}
                                    onChangeText={setSenha}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirmar Senha"
                                    placeholderTextColor="#888888"
                                    secureTextEntry
                                    value={confirmarSenha}
                                    onChangeText={setConfirmarSenha}
                                />

                            <View style={styles.inputMiniSection}>
                                <View style={styles.generoContainer}>
                                    <Pressable
                                        style={styles.inputMini}
                                        onPress={() => setShowGeneros(!showGeneros)}
                                    >
                                        <Text style={{ color: genero === 'Gênero' ? '#888888' : 'black', fontSize: 16 }}>
                                            {genero} ▼
                                        </Text>
                                    </Pressable>
                                    {showGeneros && (
                                        <View style={styles.dropdownOverlay}>
                                            {opcoesGenero.map((opcao) => (
                                                <Pressable
                                                    key={opcao}
                                                    style={styles.dropdownItem}
                                                    onPress={() => {
                                                        setGenero(opcao);
                                                        setShowGeneros(false);
                                                    }}
                                                >
                                                    <Text style={styles.dropdownText}>{opcao}</Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                    )}
                                </View>
                                <TextInput
                                    style={styles.inputMiniPhone}
                                    placeholder="Telefone"
                                    placeholderTextColor="#888888"
                                    keyboardType="phone-pad"
                                    value={telefone}
                                    onChangeText={setTelefone}
                                />
                            </View>
                            </View>

                            <Pressable
                                onPress={handleEntrar}
                                style={styles.mainButton}
                            >
                                <Text style={styles.mainButtonText}>
                                    {isLoading ? 'Cadastrando...' : 'Cadastrar-se'}
                                </Text>
                            </Pressable>
                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Não tem uma conta? </Text>
                                <Pressable onPress={() => navigation.pop()}>
                                <Text style={styles.footerLink}>Voltar</Text>
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
    header:{
        justifyContent: 'flex-start',
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        gap: 10,
    },
    keyboardContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    title:{
        paddingLeft: 10,
        color: Colors.primaryBlue,
        fontSize: 28,
        fontFamily: 'Inter-Black'
    },
    logo:{
        height: 100,  
        width: 100,                 
        resizeMode: 'contain',
    },
    formContainer:{
        width: '100%',
        backgroundColor: Colors.primaryOrange,
        padding: 20,
        alignSelf: 'center',
        borderRadius: 20
    },
    input: {
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        backgroundColor: Colors.secondaryOrange,
    },
    inputMini: {
        borderRadius: 8,
        padding: 15,
        backgroundColor: Colors.secondaryOrange,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 54,
    },   
    welcomeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'black', 
    },
    
    welcomeSubtitle: {
        fontSize: 14,
        color: Colors.secondaryBlue,
        opacity: 0.9,
        marginBottom: 24,
    },
    inputsSection: {
        gap: 16, 
        marginBottom: 24,
    },
    inputMiniSection: {
        flexDirection: 'row',
        width: '100%',
        gap: 16,
        marginBottom: 24,
        zIndex: 10,
        elevation: 10,
    },
    inputMiniPhone: {
        flex: 1,
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        backgroundColor: Colors.secondaryOrange,
        height: 54,
    },
    generoContainer: {
        flex: 1,
        position: 'relative',
    },
    dropdownOverlay: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        backgroundColor: Colors.secondaryOrange,
        borderRadius: 8,
        padding: 4,
        zIndex: 999,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    dropdownText: {
        fontSize: 16,
        color: 'black',
    },
    mainButton: {
        backgroundColor: Colors.primaryBlue,
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
        color: Colors.primaryBlue,
        textDecorationLine: 'underline',
    }
});