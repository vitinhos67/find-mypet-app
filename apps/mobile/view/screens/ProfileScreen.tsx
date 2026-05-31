import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useProfileViewModel } from '../../viewmodels/useProfileViewModel';
import { Colors } from '../styles/color';

export default function ProfileScreen() {
    const { darkMode, toggleTheme } = useTheme();

    const {
        usuario,
        profileImage,
        isEditing,
        isSaving,
        nome,
        telefone,
        genero,
        message,
        errorMessage,
        setNome,
        setTelefone,
        setGenero,
        iniciarEdicao,
        cancelarEdicao,
        salvarPerfil,
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
            await salvarImagemPerfil(resultado.assets[0].uri);
        }
    }

    return (
        <SafeAreaView
            style={[
                styles.container,
                darkMode && styles.containerDark,
            ]}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text
                        style={[
                            styles.headerTitle,
                            darkMode && styles.textDark,
                        ]}
                    >
                        Meu Perfil
                    </Text>

                    <Text
                        style={[
                            styles.headerSubtitle,
                            darkMode && styles.subtitleDark,
                        ]}
                    >
                        Gerencie sua conta e preferências
                    </Text>
                </View>

                <View
                    style={[
                        styles.profileCard,
                        darkMode && styles.cardDark,
                    ]}
                >
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
                                darkMode && styles.textDark,
                            ]}
                        >
                            {usuario.nome || 'Usuário'}
                        </Text>

                        {!isEditing ? (
                            <Pressable
                                style={styles.editButton}
                                onPress={iniciarEdicao}
                            >
                                <Text style={styles.editButtonText}>
                                    Editar Perfil
                                </Text>
                            </Pressable>
                        ) : null}
                    </View>
                </View>

                {message ? (
                    <Text style={styles.successText}>{message}</Text>
                ) : null}

                {errorMessage ? (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}

                {isEditing ? (
                    <View
                        style={[
                            styles.editForm,
                            darkMode && styles.cardDark,
                        ]}
                    >
                        <Text style={[styles.inputLabel, darkMode && styles.textDark]}>
                            Nome completo
                        </Text>
                        <TextInput
                            style={[styles.input, darkMode && styles.inputDark]}
                            value={nome}
                            onChangeText={setNome}
                            placeholder="Seu nome"
                            placeholderTextColor="#888888"
                        />

                        <Text style={[styles.inputLabel, darkMode && styles.textDark]}>
                            Telefone
                        </Text>
                        <TextInput
                            style={[styles.input, darkMode && styles.inputDark]}
                            value={telefone}
                            onChangeText={setTelefone}
                            placeholder="Seu telefone"
                            placeholderTextColor="#888888"
                            keyboardType="phone-pad"
                        />

                        <Text style={[styles.inputLabel, darkMode && styles.textDark]}>
                            Gênero
                        </Text>
                        <TextInput
                            style={[styles.input, darkMode && styles.inputDark]}
                            value={genero}
                            onChangeText={setGenero}
                            placeholder="Seu gênero"
                            placeholderTextColor="#888888"
                        />

                        <View style={styles.formActions}>
                            <Pressable
                                style={styles.cancelButton}
                                onPress={cancelarEdicao}
                                disabled={isSaving}
                            >
                                <Text style={styles.cancelButtonText}>
                                    Cancelar
                                </Text>
                            </Pressable>

                            <Pressable
                                style={styles.saveButton}
                                onPress={salvarPerfil}
                                disabled={isSaving}
                            >
                                <Text style={styles.saveButtonText}>
                                    {isSaving ? 'Salvando...' : 'Salvar'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                ) : null}

                <ProfileInfoCard
                    label="Email"
                    value={usuario.email || 'email@email.com'}
                    darkMode={darkMode}
                />

                <ProfileInfoCard
                    label="Telefone"
                    value={usuario.telefone || 'Não informado'}
                    darkMode={darkMode}
                />

                <ProfileInfoCard
                    label="Gênero"
                    value={usuario.genero || 'Não informado'}
                    darkMode={darkMode}
                />

                <View
                    style={[
                        styles.settingsCard,
                        darkMode && styles.cardDark,
                    ]}
                >
                    <View>
                        <Text
                            style={[
                                styles.configTitle,
                                darkMode && styles.textDark,
                            ]}
                        >
                            Tema
                        </Text>

                        <Text
                            style={[
                                styles.configSubtitle,
                                darkMode && styles.subtitleDark,
                            ]}
                        >
                            {darkMode ? 'Modo Escuro Ativado' : 'Modo Claro Ativado'}
                        </Text>
                    </View>

                    <Pressable
                        style={[
                            styles.themeButton,
                            darkMode && styles.themeButtonDark,
                        ]}
                        onPress={toggleTheme}
                    >
                        <Text style={styles.themeButtonText}>
                            {darkMode ? 'Escuro' : 'Claro'}
                        </Text>
                    </Pressable>
                </View>

                <Pressable
                    style={styles.logoutButton}
                    onPress={realizarLogout}
                >
                    <Text style={styles.logoutText}>
                        Sair da Conta
                    </Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

function ProfileInfoCard({
    label,
    value,
    darkMode,
}: {
    label: string;
    value: string;
    darkMode: boolean;
}) {
    return (
        <View
            style={[
                styles.infoCard,
                darkMode && styles.cardDark,
            ]}
        >
            <Text
                style={[
                    styles.infoLabel,
                    darkMode && styles.textDark,
                ]}
            >
                {label}
            </Text>

            <Text
                style={[
                    styles.infoValue,
                    darkMode && styles.textDark,
                ]}
                numberOfLines={1}
            >
                {value}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        padding: 30,
    },
    containerDark: {
        backgroundColor: Colors.dark.background,
    },
    textDark: {
        color: 'white',
    },
    header: {
        marginBottom: 25,
    },
    headerTitle: {
        fontSize: 28,
        fontFamily: 'Inter-Bold',
        color: Colors.brand.primaryBlue,
    },
    headerSubtitle: {
        marginTop: 4,
        fontSize: 14,
        color: Colors.light.textSecondary,
        fontFamily: 'Inter-Regular',
    },
    subtitleDark: {
        color: Colors.dark.textSecondary,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        backgroundColor: Colors.light.surface,
        padding: 20,
        elevation: 3,
        borderRadius: 10,
    },
    cardDark: {
        backgroundColor: Colors.dark.surface,
    },
    profilePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#D9D9D9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: Colors.brand.primaryBlue,
    },
    profilePlaceholderText: {
        fontSize: 20,
        fontFamily: 'Inter-Regular',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: Colors.brand.primaryBlue,
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
    successText: {
        marginTop: 14,
        color: '#15803d',
        fontFamily: 'Inter-Bold',
    },
    errorText: {
        marginTop: 14,
        color: '#dc2626',
        fontFamily: 'Inter-Bold',
    },
    editForm: {
        marginTop: 20,
        backgroundColor: Colors.light.surface,
        padding: 20,
        borderRadius: 10,
        elevation: 2,
    },
    inputLabel: {
        fontSize: 14,
        fontFamily: 'Inter-Bold',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        fontFamily: 'Inter-Regular',
    },
    inputDark: {
        backgroundColor: '#121212',
        color: 'white',
        borderColor: '#333333',
    },
    formActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: '#e5e7eb',
    },
    cancelButtonText: {
        color: '#111827',
        fontFamily: 'Inter-Bold',
    },
    saveButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: Colors.brand.primaryBlue,
    },
    saveButtonText: {
        color: 'white',
        fontFamily: 'Inter-Bold',
    },
    infoCard: {
        marginTop: 20,
        borderRadius: 10,
        paddingVertical: 14,
        backgroundColor: Colors.light.surface,
        paddingHorizontal: 18,
        elevation: 2,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter-Bold',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        color: '#000000',
        fontFamily: 'Inter-Regular',
    },
    settingsCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.light.surface,
        marginTop: 25,
        padding: 20,
        elevation: 2,
        borderRadius: 10,
    },
    configTitle: {
        fontSize: 20,
        fontFamily: 'Inter-Bold',
    },
    configSubtitle: {
        fontSize: 13,
        marginTop: 4,
        color: Colors.light.textSecondary,
        fontFamily: 'Inter-Regular',
    },
    themeButton: {
        backgroundColor: Colors.brand.primaryOrange,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    themeButtonDark: {
        backgroundColor: Colors.brand.primaryBlue,
    },
    themeButtonText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Inter-Bold',
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 30,
    },
    logoutText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Inter-Bold',
    },
});
