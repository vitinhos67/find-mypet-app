import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Switch, Text, View, } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '../styles/color';
import { supabase } from '../../src/shared/lib/supabase';

type UsuarioType = {
    nome?: string;
    email?: string;
};

export default function ProfileScreen() {

    const {darkMode, toggleTheme} = useTheme();

    const [profileImage, setProfileImage] =
        useState<string | null>(null);

    const [usuario, setUsuario] =
        useState<UsuarioType>({});

    useEffect(() => {

        carregarImagem();
        carregarUsuario();

    }, []);

    async function carregarUsuario() {
        try {
            const { data, error } = await supabase.auth.getUser();

            if (error) {
                console.log('Erro ao buscar usuário:', error.message);
                return;
            }

            const user = data.user;

            if (!user) {
                return;
            }

            const usuarioAtual = {
                nome:
                  user.user_metadata?.nome_completo ||
                  user.user_metadata?.name ||
                  'Usuário',
                email: user.email || 'email@email.com',
            };

            setUsuario(usuarioAtual);

            await AsyncStorage.setItem(
                `@usuario_${user.id}`,
                JSON.stringify(usuarioAtual)
            );

        } catch (error) {
            console.log('Erro ao carregar usuário:', error);
        }
    }

    async function carregarImagem() {

        const imagemSalva =
            await AsyncStorage.getItem('@profile_image');

        if (imagemSalva) {

            setProfileImage(imagemSalva);
        }
    }

    async function selecionarImagem() {

        const permissao =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissao.granted) {
            return;
        }

        const resultado =
            await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

        if (!resultado.canceled) {

            const imagemUri =
                resultado.assets[0].uri;

            setProfileImage(imagemUri);

            await AsyncStorage.setItem(
                '@profile_image',
                imagemUri
            );
        }
    }

    async function handleLogout() {
        try {
            const { data } = await supabase.auth.getUser();

            if (data.user) {
                await AsyncStorage.removeItem(`@usuario_${data.user.id}`);
            }

            await AsyncStorage.removeItem('@usuario');
            await AsyncStorage.removeItem('@manter_conectado');

            const { error } = await supabase.auth.signOut();

            if (error) {
                console.log('Erro ao sair da conta:', error.message);
                return;
            }

            setUsuario({});
            setProfileImage(null);

        } catch (error) {
            console.log('Erro ao realizar logout:', error);
        }
    }

    return (

        <SafeAreaView
            style={[
                styles.container,
                darkMode && styles.containerDark
            ]}
        >
            <View style={styles.profileSection}>

                <Pressable onPress={selecionarImagem}>

                    {profileImage ? (

                        <Image
                            source={{ uri: profileImage }}
                            style={styles.profileImage}
                        />

                    ) : (

                        <View style={styles.profilePlaceholder}>
                            <Text style={styles.profilePlaceholderText}>
                                Foto
                            </Text>
                        </View>
                    )}

                </Pressable>

                <View style={styles.userInfo}>

                    <Text
                        style={[
                            styles.userName,
                            darkMode && styles.textDark
                        ]}
                    >
                        {usuario.nome || 'Usuário'}
                    </Text>

                    <Pressable style={styles.editButton}>

                        <Text style={styles.editButtonText}>
                            Editar Perfil
                        </Text>

                    </Pressable>

                </View>

            </View>

            <View
                style={[
                styles.emailCard,
                darkMode && styles.emailCardDark
                ]}
            >

                <Text
                    style={[
                    styles.emailLabel,
                    darkMode && styles.textDark
                    ]}
                >
                    Email
                </Text>

                <Text
                    style={[
                    styles.emailValue,
                            darkMode && styles.textDark
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {usuario.email || 'email@email.com'}
                </Text>

            </View>

            <View style={styles.configSection}>

                <Text
                    style={[
                        styles.configTitle,
                        darkMode && styles.textDark
                    ]}
                >
                    Tema:
                </Text>

                <Pressable
                    style={[
                        styles.themeSwitch,
                        darkMode && styles.themeSwitchDark
                    ]}
                    onPress={toggleTheme}
                >

                    <View
                        style={[
                            styles.themeBall,
                            darkMode && styles.themeBallDark
                        ]}
                    />

                    <Text style={styles.themeIcon}>
                        {darkMode ? '🌙' : '☀️'}
                    </Text>

                </Pressable>

            </View>

            <View style={styles.logoutContainer}>

                <Pressable
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >

                    <Text style={styles.logoutText}>
                        Sair da Conta
                    </Text>

                </Pressable>

            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F2F2F2',
        padding: 30,
    },

    containerDark: {
        backgroundColor: '#121212',
    },

    textDark: {
        color: 'white',
    },

    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginTop: 20,
    },

    profilePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#D9D9D9',
        justifyContent: 'center',
        alignItems: 'center',
    },

    profilePlaceholderText: {
        fontSize: 28,
        fontFamily: 'Inter-Bold',
    },

    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },

    userInfo: {
        flex: 1,
    },

    userName: {
        fontSize: 30,
        fontFamily: 'Inter-Bold',
        marginBottom: 10,
    },

    editButton: {
        backgroundColor: Colors.primaryOrange,
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'center',
    },

    editButtonText: {
        fontSize: 20,
        fontFamily: 'Inter-Bold',
    },

    configSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 40,
        gap: 20,
    },

    configTitle: {
        fontSize: 28,
        fontFamily: 'Inter-Bold',
    },

    logoutContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 30,
    },

    logoutButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 20,
    },

    logoutText: {
        color: 'white',
        fontSize: 22,
        fontFamily: 'Inter-Bold',
    },
    themeSwitch: {
        width: 90,
        height: 42,
        borderRadius: 30,
        backgroundColor: '#D9D9D9',
        justifyContent: 'center',
        paddingHorizontal: 5,
    },

    themeSwitchDark: {
        backgroundColor: Colors.primaryBlue,
    },

    themeBall: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'white',
    },

    themeBallDark: {
        alignSelf: 'flex-end',
    },

    themeIcon: {
        position: 'absolute',
        alignSelf: 'center',
        fontSize: 18,
    },

    emailCard: {
        marginTop: 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 18,
        elevation: 2,
    },

    emailLabel: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter-Bold',
        marginBottom: 4,
    },

    emailValue: {
        fontSize: 18,
        color: '#000000',
        fontFamily: 'Inter-Bold',
    },

    emailCardDark: {
        backgroundColor: '#1E1E1E',
    },
});