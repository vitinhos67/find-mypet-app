import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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

import { useTheme } from '../../hooks/useTheme';
import { PetStackParamList } from '../../navigation/types';
import { usePetViewModel } from '../../viewmodels/usePetViewModel';
import { SexoSelector } from '../components/SexoSelector';
import { Colors } from '../styles/color';

type PetDetailsRouteProp = RouteProp<PetStackParamList, 'PetDetails'>;

export default function PetDetailsScreen() {
    const navigation = useNavigation();
    const route = useRoute<PetDetailsRouteProp>();
    const { petId } = route.params;
    const { getPetById, atualizarPet, excluirPet, carregarPets, selecionarFoto, isLoading } = usePetViewModel();
    const { darkMode } = useTheme();
    const theme = darkMode ? Colors.dark : Colors.light;

    const pet = getPetById(petId);

    const [foto, setFoto] = useState('');
    const [nome, setNome] = useState('');
    const [raca, setRaca] = useState('');
    const [cor, setCor] = useState('');
    const [descricao, setDescricao] = useState('');
    const [sexo, setSexo] = useState<'MACHO' | 'FEMEA'>('MACHO');

    useEffect(() => {
        carregarPets();
    }, [carregarPets]);

    useEffect(() => {
        if (pet) {
            setFoto(pet.foto || '');
            setNome(pet.nome);
            setRaca(pet.raca);
            setCor(pet.cor);
            setSexo(pet.sexo);
            setDescricao(pet.descricao);
        }
    }, [pet]);

    async function handleSelecionarFoto() {
        const uri = await selecionarFoto();
        if (uri) setFoto(uri);
    }

    async function handleSalvar() {
        await atualizarPet(petId, foto, nome, raca, cor, sexo, descricao);
        navigation.goBack();
    }

    function handleExcluir() {
        Alert.alert(
            'Excluir Pet',
            `Deseja realmente excluir ${nome || 'este pet'}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        await excluirPet(petId);
                        navigation.goBack();
                    }
                }
            ]
        );
    }

    if (!pet) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.brand.primaryBlue} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={[styles.header, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
                        <Text style={[styles.btnVoltar, { color: Colors.brand.primaryBlue }]}>← Voltar</Text>
                    </Pressable>
                    <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Editar Pet</Text>
                    <View style={{ width: 60 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Pressable style={styles.photoWrapper} onPress={handleSelecionarFoto}>
                        {foto ? (
                            <Image source={{ uri: foto }} style={styles.photo} />
                        ) : (
                            <View style={[styles.photoPlaceholder, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <Text style={styles.photoIcon}>📷</Text>
                                <Text style={[styles.photoHint, { color: theme.textSecondary }]}>
                                    Adicionar foto
                                </Text>
                            </View>
                        )}
                        <View style={styles.photoBadge}>
                            <Text style={styles.photoBadgeText}>✎</Text>
                        </View>
                    </Pressable>

                    <View style={[styles.formCard, { backgroundColor: theme.surface }]}>
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Nome</Text>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                value={nome}
                                onChangeText={setNome}
                                placeholderTextColor={theme.textSecondary}
                            />
                        </View>

                        <View style={[styles.separator, { backgroundColor: theme.border }]} />

                        <View style={styles.fieldGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Raça</Text>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                value={raca}
                                onChangeText={setRaca}
                                placeholderTextColor={theme.textSecondary}
                            />
                        </View>

                        <View style={[styles.separator, { backgroundColor: theme.border }]} />

                        <View style={styles.fieldGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Cor</Text>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                value={cor}
                                onChangeText={setCor}
                                placeholderTextColor={theme.textSecondary}
                            />
                        </View>
                    </View>

                    <View style={[styles.formCard, { backgroundColor: theme.surface }]}>
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Sexo</Text>
                            <SexoSelector
                                value={sexo}
                                onChange={setSexo}
                                surfaceColor={theme.background}
                                borderColor={theme.border}
                                textSecondaryColor={theme.textSecondary}
                            />
                        </View>
                    </View>

                    <View style={[styles.formCard, { backgroundColor: theme.surface }]}>
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Descrição</Text>
                            <TextInput
                                multiline
                                numberOfLines={4}
                                value={descricao}
                                onChangeText={setDescricao}
                                style={[styles.textArea, { color: theme.textPrimary }]}
                                placeholder="Conte um pouco sobre o seu pet..."
                                placeholderTextColor={theme.textSecondary}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    <Pressable
                        style={[styles.btnSalvar, isLoading && styles.btnDisabled]}
                        onPress={handleSalvar}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.btnSalvarText}>Salvar Alterações</Text>
                        )}
                    </Pressable>

                    <Pressable style={styles.btnExcluir} onPress={handleExcluir} disabled={isLoading}>
                        <Text style={styles.btnExcluirText}>Excluir Pet</Text>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },

    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
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
        fontSize: 18,
        fontFamily: 'Inter-Bold'
    },

    content: {
        padding: 16,
        paddingBottom: 40,
        gap: 12
    },

    photoWrapper: {
        alignSelf: 'center',
        marginBottom: 4,
        marginTop: 8
    },

    photo: {
        width: 110,
        height: 110,
        borderRadius: 55
    },

    photoPlaceholder: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4
    },

    photoIcon: {
        fontSize: 28
    },

    photoHint: {
        fontSize: 11,
        fontFamily: 'Inter-Regular'
    },

    photoBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.brand.primaryOrange,
        justifyContent: 'center',
        alignItems: 'center'
    },

    photoBadgeText: {
        color: 'white',
        fontSize: 14
    },

    formCard: {
        borderRadius: 14,
        paddingHorizontal: 16,
        overflow: 'hidden'
    },

    fieldGroup: {
        paddingVertical: 12
    },

    separator: {
        height: 1
    },

    label: {
        fontSize: 12,
        fontFamily: 'Inter-Bold',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },

    input: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        paddingVertical: 4
    },

    textArea: {
        fontSize: 15,
        fontFamily: 'Inter-Regular',
        minHeight: 90,
        lineHeight: 22
    },

    btnSalvar: {
        backgroundColor: Colors.brand.primaryBlue,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 4
    },

    btnDisabled: {
        opacity: 0.65
    },

    btnSalvarText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Inter-Bold'
    },

    btnExcluir: {
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ef4444'
    },

    btnExcluirText: {
        color: '#ef4444',
        fontSize: 15,
        fontFamily: 'Inter-Bold'
    }
});
