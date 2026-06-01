import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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

import { useTheme } from '../../hooks/useTheme';
import { usePetViewModel } from '../../viewmodels/usePetViewModel';
import { SexoSelector } from '../components/SexoSelector';
import { Colors } from '../styles/color';

export default function PetAddScreen() {
    const navigation = useNavigation();
    const { adicionarPet, selecionarFoto, isLoading } = usePetViewModel();
    const { darkMode } = useTheme();
    const theme = darkMode ? Colors.dark : Colors.light;

    const [foto, setFoto] = useState('');
    const [nome, setNome] = useState('');
    const [raca, setRaca] = useState('');
    const [cor, setCor] = useState('');
    const [descricao, setDescricao] = useState('');
    const [sexo, setSexo] = useState<'MACHO' | 'FEMEA'>('MACHO');

    async function handleSelecionarFoto() {
        const uri = await selecionarFoto();
        if (uri) setFoto(uri);
    }

    async function handleSalvar() {
        const sucesso = await adicionarPet(foto, nome, raca, cor, sexo, descricao);
        if (sucesso) navigation.goBack();
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn} hitSlop={8}>
                        <Ionicons name="chevron-back" size={22} color={theme.textPrimary} />
                    </Pressable>
                    <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Novo Pet</Text>
                    <View style={styles.iconBtn} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Foto */}
                    <Pressable style={styles.photoWrap} onPress={handleSelecionarFoto}>
                        {foto ? (
                            <Image source={{ uri: foto }} style={styles.photo} />
                        ) : (
                            <View style={[styles.photoEmpty, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <Ionicons name="camera-outline" size={32} color={theme.textSecondary} />
                                <Text style={[styles.photoHint, { color: theme.textSecondary }]}>Adicionar foto</Text>
                            </View>
                        )}
                        <View style={styles.photoBadge}>
                            <Ionicons name="pencil" size={12} color="#fff" />
                        </View>
                    </Pressable>

                    {/* Campos principais */}
                    <View style={[styles.card, { backgroundColor: theme.surface }]}>
                        <Field label="Nome" theme={theme}>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                value={nome}
                                onChangeText={setNome}
                                placeholder="Ex: Rex"
                                placeholderTextColor={theme.textSecondary}
                            />
                        </Field>
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <Field label="Raça" theme={theme}>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                value={raca}
                                onChangeText={setRaca}
                                placeholder="Ex: Labrador"
                                placeholderTextColor={theme.textSecondary}
                            />
                        </Field>
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <Field label="Cor" theme={theme}>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                value={cor}
                                onChangeText={setCor}
                                placeholder="Ex: Caramelo"
                                placeholderTextColor={theme.textSecondary}
                            />
                        </Field>
                    </View>

                    {/* Sexo */}
                    <View style={[styles.card, { backgroundColor: theme.surface }]}>
                        <Field label="Sexo" theme={theme}>
                            <SexoSelector
                                value={sexo}
                                onChange={setSexo}
                                surfaceColor={theme.background}
                                borderColor={theme.border}
                                textSecondaryColor={theme.textSecondary}
                            />
                        </Field>
                    </View>

                    {/* Descrição */}
                    <View style={[styles.card, { backgroundColor: theme.surface }]}>
                        <Field label="Descrição" theme={theme}>
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
                        </Field>
                    </View>

                    <Pressable
                        style={({ pressed }) => [styles.btnPrimary, isLoading && { opacity: 0.65 }, { opacity: pressed && !isLoading ? 0.85 : undefined }]}
                        onPress={handleSalvar}
                        disabled={isLoading}
                    >
                        {isLoading
                            ? <ActivityIndicator color="white" />
                            : <Text style={styles.btnPrimaryText}>Cadastrar Pet</Text>
                        }
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function Field({ label, children, theme }: { label: string; children: React.ReactNode; theme: any }) {
    return (
        <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    header: {
        height: 56,
        paddingHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
    },

    headerTitle: {
        fontSize: 17,
        fontFamily: 'Inter-Bold',
        letterSpacing: -0.2,
    },

    iconBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },

    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 48,
        gap: 12,
    },

    photoWrap: {
        alignSelf: 'center',
        marginBottom: 4,
    },

    photo: {
        width: 100,
        height: 100,
        borderRadius: 24,
    },

    photoEmpty: {
        width: 100,
        height: 100,
        borderRadius: 24,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },

    photoHint: {
        fontSize: 11,
        fontFamily: 'Inter-Regular',
    },

    photoBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 26,
        height: 26,
        borderRadius: 9,
        backgroundColor: Colors.brand.primaryOrange,
        justifyContent: 'center',
        alignItems: 'center',
    },

    card: {
        borderRadius: 18,
        paddingHorizontal: 18,
        overflow: 'hidden',
    },

    fieldWrap: { paddingVertical: 14 },

    divider: { height: 1 },

    label: {
        fontSize: 11,
        fontFamily: 'Inter-Bold',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 8,
    },

    input: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        paddingVertical: 0,
    },

    textArea: {
        fontSize: 15,
        fontFamily: 'Inter-Regular',
        minHeight: 80,
        lineHeight: 22,
    },

    btnPrimary: {
        backgroundColor: Colors.brand.primaryBlue,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 4,
    },

    btnPrimaryText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Inter-Bold',
    },
});
