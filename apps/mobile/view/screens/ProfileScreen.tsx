import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useProfileViewModel } from '../../viewmodels/useProfileViewModel';
import { Colors } from '../styles/color';

export default function ProfileScreen() {

    const {darkMode, toggleTheme} = useTheme();

    const {
        usuario,
        profileImage,
        salvarImagemPerfil,
        realizarLogout,
    } = useProfileViewModel();

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

            await salvarImagemPerfil(imagemUri);
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
                    onPress={realizarLogout}
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
        backgroundColor: Colors.light.background,
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
        fontSize: 20,
        fontFamily: 'Inter-Regular',
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
        fontSize: 20,
        fontFamily: 'Inter-Bold',
        marginBottom: 10,
    },

    editButton: {
        backgroundColor: Colors.brand.primaryOrange,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },

    editButtonText: {
        fontSize: 14,
        fontFamily: 'Inter-Bold',
    },

    configSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 40,
        gap: 20,
    },

    configTitle: {
        fontSize: 20,
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
        borderRadius: 10,
    },

    logoutText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Inter-Bold',
    },
    themeSwitch: {
        width: 90,
        height: 42,
        borderRadius: 10,
        backgroundColor: '#D9D9D9',
        justifyContent: 'center',
        paddingHorizontal: 5,
    },

    themeSwitchDark: {
        backgroundColor: Colors.brand.primaryBlue,
    },

    themeBall: {
        width: 32,
        height: 32,
        borderRadius: 10,
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
        borderRadius: 10,
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
        fontSize: 14,
        color: '#000000',
        fontFamily: 'Inter-Regular',
    },

    emailCardDark: {
        backgroundColor: '#1E1E1E',
    },
});