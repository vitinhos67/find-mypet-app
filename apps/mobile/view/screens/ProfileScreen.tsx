import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import { useProfileViewModel } from '../../src/viewmodels/useProfileViewModel';
import { Colors } from '../styles/color';

const GENERO_OPTIONS = ['Masculino', 'Feminino', 'Outro'];

export default function ProfileScreen() {
    const { darkMode, toggleTheme } = useTheme();
    const theme = darkMode ? Colors.dark : Colors.light;
    const [avatarFailed, setAvatarFailed] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);
    const {
        usuario, profileImage, isEditing, isSaving,
        nome, telefone, genero, message, errorMessage,
        setNome, setTelefone, setGenero,
        iniciarEdicao, cancelarEdicao, salvarPerfil,
        salvarImagemPerfil, realizarLogout,
    } = useProfileViewModel();

    useEffect(() => { setAvatarFailed(false); }, [profileImage]);

    async function selecionarImagem() {
        if (!isEditing) return;

        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return;
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled) {
            await salvarImagemPerfil(result.assets[0].uri, result.assets[0].mimeType);
        }
    }

    const initials = (usuario.nome || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Perfil</Text>
                    <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
                        Gerencie sua conta e preferências
                    </Text>
                </View>

                {/* Avatar + info */}
                <View style={[styles.profileCard, { backgroundColor: theme.surface }]}>
                    <Pressable
                        onPress={() => {
                            if (isEditing) {
                                selecionarImagem();
                                return;
                            }

                            if (profileImage) {
                                setShowFullImage(true);
                            }
                        }}
                        style={styles.avatarWrap}
                    >
                        {profileImage && !avatarFailed ? (
                            <ExpoImage
                                key={profileImage}
                                source={{ uri: profileImage }}
                                style={styles.avatar}
                                contentFit="cover"
                                cachePolicy="none"
                                onError={() => setAvatarFailed(true)}
                            />
                        ) : (
                            <View style={[styles.avatarFallback, { backgroundColor: Colors.brand.primaryBlue + '18' }]}>
                                <Text style={[styles.avatarInitials, { color: Colors.brand.primaryBlue }]}>
                                    {initials}
                                </Text>
                            </View>
                        )}
                        {isEditing && (
                            <View style={styles.avatarBadge}>
                                <Ionicons name="camera" size={11} color="#fff" />
                            </View>
                        )}
                    </Pressable>

                    <View style={styles.profileInfo}>
                        <Text style={[styles.profileName, { color: theme.textPrimary }]} numberOfLines={1}>
                            {usuario.nome || 'Usuário'}
                        </Text>
                        <Text style={[styles.profileEmail, { color: theme.textSecondary }]} numberOfLines={1}>
                            {usuario.email || '—'}
                        </Text>
                        {!isEditing && (
                            <Pressable
                                style={({ pressed }) => [styles.editBtn, { opacity: pressed ? 0.75 : 1 }]}
                                onPress={iniciarEdicao}
                            >
                                <Ionicons name="create-outline" size={14} color={Colors.brand.primaryBlue} />
                                <Text style={[styles.editBtnText, { color: Colors.brand.primaryBlue }]}>Editar perfil</Text>
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* Mensagens */}
                {!!message && (
                    <View style={[styles.msgBox, { backgroundColor: '#F0FDF4' }]}>
                        <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                        <Text style={[styles.msgText, { color: '#16A34A' }]}>{message}</Text>
                    </View>
                )}
                {!!errorMessage && (
                    <View style={[styles.msgBox, { backgroundColor: '#FEF2F2' }]}>
                        <Ionicons name="alert-circle" size={16} color="#DC2626" />
                        <Text style={[styles.msgText, { color: '#DC2626' }]}>{errorMessage}</Text>
                    </View>
                )}

                {/* Formulário de edição */}
                {isEditing && (
                    <View style={[styles.editCard, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.editCardTitle, { color: theme.textPrimary }]}>Editar informações</Text>

                        <FormField label="Nome completo" theme={theme}>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.background }]}
                                value={nome}
                                onChangeText={setNome}
                                placeholder="Seu nome"
                                placeholderTextColor={theme.textSecondary}
                            />
                        </FormField>

                        <FormField label="Telefone" theme={theme}>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.background }]}
                                value={telefone}
                                onChangeText={setTelefone}
                                placeholder="DDD + 9 números"
                                placeholderTextColor={theme.textSecondary}
                                keyboardType="phone-pad"
                                maxLength={11}
                            />
                        </FormField>

                        <FormField label="Gênero" theme={theme}>
                            <View style={styles.genderRow}>
                                {GENERO_OPTIONS.map((opt) => {
                                    const sel = genero === opt;
                                    return (
                                        <Pressable
                                            key={opt}
                                            style={[
                                                styles.genderChip,
                                                { borderColor: theme.border, backgroundColor: theme.background },
                                                sel && { backgroundColor: Colors.brand.primaryBlue, borderColor: Colors.brand.primaryBlue }
                                            ]}
                                            onPress={() => setGenero(opt)}
                                        >
                                            <Text style={[
                                                styles.genderChipText,
                                                { color: theme.textSecondary },
                                                sel && { color: '#fff' }
                                            ]}>
                                                {opt}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </FormField>

                        <View style={styles.editActions}>
                            <Pressable
                                style={[styles.cancelBtn, { backgroundColor: theme.border }]}
                                onPress={cancelarEdicao}
                                disabled={isSaving}
                            >
                                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancelar</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.saveBtn, isSaving && { opacity: 0.65 }]}
                                onPress={salvarPerfil}
                                disabled={isSaving}
                            >
                                {isSaving
                                    ? <ActivityIndicator color="#fff" size="small" />
                                    : <Text style={styles.saveBtnText}>Salvar</Text>
                                }
                            </Pressable>
                        </View>
                    </View>
                )}

                {/* Informações */}
                <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
                    <InfoRow label="Telefone" value={usuario.telefone || 'Não informado'} theme={theme} />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <InfoRow label="Gênero" value={usuario.genero || 'Não informado'} theme={theme} last />
                </View>

                {/* Configurações */}
                <View style={[styles.settingsCard, { backgroundColor: theme.surface }]}>
                    <View>
                        <Text style={[styles.settingsTitle, { color: theme.textPrimary }]}>Aparência</Text>
                        <Text style={[styles.settingsSub, { color: theme.textSecondary }]}>
                            {darkMode ? 'Modo Escuro' : 'Modo Claro'}
                        </Text>
                    </View>
                    <Pressable
                        style={({ pressed }) => [styles.themeToggle, { opacity: pressed ? 0.8 : 1 }]}
                        onPress={toggleTheme}
                    >
                        <Ionicons
                            name={darkMode ? 'moon' : 'sunny'}
                            size={16}
                            color={darkMode ? Colors.brand.primaryBlue : Colors.brand.primaryOrange}
                        />
                        <Text style={[styles.themeToggleText, { color: darkMode ? Colors.brand.primaryBlue : Colors.brand.primaryOrange }]}>
                            {darkMode ? 'Escuro' : 'Claro'}
                        </Text>
                    </Pressable>
                </View>

                {/* Logout */}
                <Pressable
                    style={({ pressed }) => [styles.logoutBtn, { opacity: pressed ? 0.8 : 1 }]}
                    onPress={realizarLogout}
                >
                    <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                    <Text style={styles.logoutText}>Sair da Conta</Text>
                </Pressable>
            </ScrollView>

            <Modal
                visible={showFullImage}
                transparent
                animationType="fade"
                onRequestClose={() => setShowFullImage(false)}
            >
                <Pressable
                    style={styles.fullImageContainer}
                    onPress={() => setShowFullImage(false)}
                >
                    <ExpoImage
                        source={{ uri: profileImage ?? undefined }}
                        style={styles.fullImage}
                        contentFit="contain"
                    />
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

function FormField({ label, children, theme }: { label: string; children: React.ReactNode; theme: any }) {
    return (
        <View style={styles.formFieldWrap}>
            <Text style={[styles.formFieldLabel, { color: theme.textSecondary }]}>{label}</Text>
            {children}
        </View>
    );
}

function InfoRow({ label, value, theme, last }: { label: string; value: string; theme: any; last?: boolean }) {
    return (
        <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
            <Text style={[styles.infoValue, { color: theme.textPrimary }]} numberOfLines={1}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    scroll: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 48,
        gap: 12,
    },

    header: { marginBottom: 4 },

    headerTitle: {
        fontSize: 26,
        fontFamily: 'Inter-Bold',
        letterSpacing: -0.5,
    },

    headerSub: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        marginTop: 3,
    },

    profileCard: {
        borderRadius: 18,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },

    avatarWrap: { position: 'relative' },

    avatar: {
        width: 72,
        height: 72,
        borderRadius: 20,
    },

    avatarFallback: {
        width: 72,
        height: 72,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    avatarInitials: {
        fontSize: 24,
        fontFamily: 'Inter-Bold',
    },

    avatarBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 22,
        height: 22,
        borderRadius: 8,
        backgroundColor: Colors.brand.primaryOrange,
        justifyContent: 'center',
        alignItems: 'center',
    },

    profileInfo: { flex: 1, gap: 4 },

    profileName: {
        fontSize: 18,
        fontFamily: 'Inter-Bold',
        letterSpacing: -0.3,
    },

    profileEmail: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
    },

    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 6,
        alignSelf: 'flex-start',
    },

    editBtnText: {
        fontSize: 13,
        fontFamily: 'Inter-Bold',
    },

    msgBox: {
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    msgText: {
        fontSize: 13,
        fontFamily: 'Inter-Bold',
        flex: 1,
    },

    editCard: {
        borderRadius: 18,
        padding: 18,
        gap: 14,
    },

    editCardTitle: {
        fontSize: 15,
        fontFamily: 'Inter-Bold',
        marginBottom: 2,
    },

    formFieldWrap: { gap: 8 },

    formFieldLabel: {
        fontSize: 11,
        fontFamily: 'Inter-Bold',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },

    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        fontFamily: 'Inter-Regular',
    },

    genderRow: {
        flexDirection: 'row',
        gap: 8,
    },

    genderChip: {
        flex: 1,
        paddingVertical: 11,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },

    genderChipText: {
        fontSize: 13,
        fontFamily: 'Inter-Bold',
    },

    editActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
    },

    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },

    cancelBtnText: {
        fontSize: 14,
        fontFamily: 'Inter-Bold',
    },

    saveBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        backgroundColor: Colors.brand.primaryBlue,
    },

    saveBtnText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Inter-Bold',
    },

    infoCard: {
        borderRadius: 18,
        overflow: 'hidden',
    },

    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 16,
    },

    infoLabel: {
        fontSize: 14,
        fontFamily: 'Inter-Bold',
    },

    infoValue: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        maxWidth: '55%',
        textAlign: 'right',
    },

    divider: { height: 1, marginHorizontal: 18 },

    settingsCard: {
        borderRadius: 18,
        padding: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    settingsTitle: {
        fontSize: 15,
        fontFamily: 'Inter-Bold',
    },

    settingsSub: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        marginTop: 2,
    },

    themeToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.brand.primaryBlue + '40',
    },

    themeToggleText: {
        fontSize: 13,
        fontFamily: 'Inter-Bold',
    },

    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EF444440',
        marginTop: 8,
    },

    logoutText: {
        color: '#EF4444',
        fontSize: 15,
        fontFamily: 'Inter-Bold',
    },

    fullImageContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    fullImage: {
        width: '100%',
        height: '80%',
    },
});
