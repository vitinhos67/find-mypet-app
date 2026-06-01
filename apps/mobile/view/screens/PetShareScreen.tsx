import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';
import { PetShare, SharePermission } from '../../models/pet.model';
import { PetStackParamList } from '../../navigation/types';
import { ShareService } from '../../services/ShareService';
import { Colors } from '../styles/color';

type RouteProps = RouteProp<PetStackParamList, 'PetShare'>;
type NavProps = NativeStackNavigationProp<PetStackParamList, 'PetShare'>;

const PERMISSION_LABELS: Record<SharePermission, string> = {
    VIEW: 'Visualizar',
    EDIT: 'Editar'
};

export default function PetShareScreen() {
    const navigation = useNavigation<NavProps>();
    const route = useRoute<RouteProps>();
    const { petId, petNome } = route.params;

    const { darkMode } = useTheme();
    const theme = darkMode ? Colors.dark : Colors.light;

    const [shares, setShares] = useState<PetShare[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState<SharePermission>('VIEW');

    const carregarShares = useCallback(async () => {
        setIsLoading(true);
        try {
            const resposta: any = await ShareService.listShares(petId);
            const data = Array.isArray(resposta) ? resposta : (resposta?.data || []);
            setShares(data);
        } catch (error) {
            console.error('Erro ao carregar compartilhamentos:', error);
        } finally {
            setIsLoading(false);
        }
    }, [petId]);

    useEffect(() => {
        carregarShares();
    }, [carregarShares]);

    async function handleCompartilhar() {
        if (!email.trim()) {
            Alert.alert('Erro', 'Informe o email para compartilhar.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            Alert.alert('Erro', 'Informe um email válido.');
            return;
        }

        setIsSaving(true);
        try {
            await ShareService.sharePet(petId, email.trim().toLowerCase(), permission);
            setEmail('');
            await carregarShares();
            Alert.alert('Sucesso', 'Pet compartilhado com sucesso!');
        } catch (error: any) {
            const msg = error?.message || 'Não foi possível compartilhar o pet.';
            Alert.alert('Erro', msg);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleRemover(share: PetShare) {
        Alert.alert(
            'Remover acesso',
            `Remover acesso de ${share.shared_with_email}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await ShareService.removeShare(petId, share.id);
                            await carregarShares();
                        } catch {
                            Alert.alert('Erro', 'Não foi possível remover o acesso.');
                        }
                    }
                }
            ]
        );
    }

    async function handleAlterarPermissao(share: PetShare) {
        const novaPermissao: SharePermission = share.permission === 'VIEW' ? 'EDIT' : 'VIEW';
        try {
            await ShareService.updatePermission(petId, share.id, novaPermissao);
            await carregarShares();
        } catch {
            Alert.alert('Erro', 'Não foi possível alterar a permissão.');
        }
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
                    <Text style={[styles.btnVoltar, { color: Colors.brand.primaryBlue }]}>← Voltar</Text>
                </Pressable>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                    Compartilhar {petNome}
                </Text>
                <View style={{ width: 60 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Formulário de novo compartilhamento */}
                <View style={[styles.formCard, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.formTitle, { color: theme.textPrimary }]}>
                        Adicionar acesso
                    </Text>
                    <Text style={[styles.formSubtitle, { color: theme.textSecondary }]}>
                        Informe o email da conta que terá acesso a este pet.
                    </Text>

                    <TextInput
                        style={[styles.input, {
                            backgroundColor: theme.background,
                            color: theme.textPrimary,
                            borderColor: theme.border
                        }]}
                        placeholder="Email do usuário"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={email}
                        onChangeText={setEmail}
                    />

                    <Text style={[styles.permissionLabel, { color: theme.textSecondary }]}>
                        Permissão
                    </Text>
                    <View style={styles.permissionRow}>
                        {(['VIEW', 'EDIT'] as SharePermission[]).map((p) => (
                            <Pressable
                                key={p}
                                style={[
                                    styles.permissionBtn,
                                    { borderColor: theme.border },
                                    permission === p && styles.permissionBtnActive
                                ]}
                                onPress={() => setPermission(p)}
                            >
                                <Text style={[
                                    styles.permissionBtnText,
                                    { color: theme.textSecondary },
                                    permission === p && styles.permissionBtnTextActive
                                ]}>
                                    {PERMISSION_LABELS[p]}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    <Pressable
                        style={({ pressed }) => [
                            styles.shareBtn,
                            { opacity: pressed || isSaving ? 0.75 : 1 }
                        ]}
                        onPress={handleCompartilhar}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.shareBtnText}>Compartilhar</Text>
                        )}
                    </Pressable>
                </View>

                {/* Lista de compartilhamentos */}
                <View style={styles.listHeader}>
                    <Text style={[styles.listTitle, { color: theme.textPrimary }]}>
                        Quem tem acesso
                    </Text>
                    {isLoading && <ActivityIndicator size="small" color={Colors.brand.primaryBlue} />}
                </View>

                <FlatList
                    data={shares}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    renderItem={({ item }) => (
                        <View style={[styles.shareItem, { backgroundColor: theme.surface }]}>
                            <View style={styles.shareItemLeft}>
                                <View style={[styles.avatarCircle, { backgroundColor: Colors.brand.primaryBlue + '20' }]}>
                                    <Text style={[styles.avatarLetter, { color: Colors.brand.primaryBlue }]}>
                                        {(item.shared_with_email ?? item.shared_with_user_id)[0].toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.shareItemInfo}>
                                    <Text style={[styles.shareEmail, { color: theme.textPrimary }]} numberOfLines={1}>
                                        {item.shared_with_email ?? item.shared_with_user_id}
                                    </Text>
                                    <Pressable onPress={() => handleAlterarPermissao(item)}>
                                        <View style={[
                                            styles.permissionTag,
                                            { backgroundColor: item.permission === 'EDIT' ? '#fef3c7' : '#dbeafe' }
                                        ]}>
                                            <Text style={[
                                                styles.permissionTagText,
                                                { color: item.permission === 'EDIT' ? '#b45309' : Colors.brand.primaryBlue }
                                            ]}>
                                                {PERMISSION_LABELS[item.permission]} · alterar
                                            </Text>
                                        </View>
                                    </Pressable>
                                </View>
                            </View>

                            <Pressable
                                onPress={() => handleRemover(item)}
                                hitSlop={10}
                                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                            >
                                <Text style={styles.removeBtn}>✕</Text>
                            </Pressable>
                        </View>
                    )}
                    ListEmptyComponent={
                        !isLoading ? (
                            <View style={styles.emptyState}>
                                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                    Nenhum compartilhamento ainda.
                                </Text>
                            </View>
                        ) : null
                    }
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },

    header: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1
    },

    btnVoltar: {
        fontSize: 15,
        fontFamily: 'Inter-Bold',
        width: 60
    },

    headerTitle: {
        fontSize: 17,
        fontFamily: 'Inter-Bold',
        flex: 1,
        textAlign: 'center'
    },

    formCard: {
        margin: 16,
        marginBottom: 8,
        borderRadius: 14,
        padding: 16,
        gap: 10
    },

    formTitle: {
        fontSize: 16,
        fontFamily: 'Inter-Bold'
    },

    formSubtitle: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        lineHeight: 18,
        marginTop: -4
    },

    input: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        fontFamily: 'Inter-Regular'
    },

    permissionLabel: {
        fontSize: 13,
        fontFamily: 'Inter-Bold',
        marginTop: 4
    },

    permissionRow: {
        flexDirection: 'row',
        gap: 10
    },

    permissionBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center'
    },

    permissionBtnActive: {
        backgroundColor: Colors.brand.primaryBlue,
        borderColor: Colors.brand.primaryBlue
    },

    permissionBtnText: {
        fontSize: 14,
        fontFamily: 'Inter-Bold'
    },

    permissionBtnTextActive: {
        color: '#fff'
    },

    shareBtn: {
        backgroundColor: Colors.brand.primaryOrange,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 4
    },

    shareBtnText: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'Inter-Bold'
    },

    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 8
    },

    listTitle: {
        fontSize: 15,
        fontFamily: 'Inter-Bold'
    },

    listContainer: {
        paddingHorizontal: 16,
        gap: 8,
        paddingBottom: 32
    },

    shareItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 12,
        gap: 10
    },

    shareItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12
    },

    avatarCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },

    avatarLetter: {
        fontSize: 16,
        fontFamily: 'Inter-Bold'
    },

    shareItemInfo: {
        flex: 1,
        gap: 4
    },

    shareEmail: {
        fontSize: 14,
        fontFamily: 'Inter-Bold'
    },

    permissionTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20
    },

    permissionTagText: {
        fontSize: 11,
        fontFamily: 'Inter-Bold'
    },

    removeBtn: {
        fontSize: 16,
        color: '#ef4444',
        fontFamily: 'Inter-Bold'
    },

    emptyState: {
        paddingVertical: 24,
        alignItems: 'center'
    },

    emptyText: {
        fontSize: 14,
        fontFamily: 'Inter-Regular'
    }
});
