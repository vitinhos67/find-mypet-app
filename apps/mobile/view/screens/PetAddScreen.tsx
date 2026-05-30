import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';;
import { usePetViewModel } from '../../viewmodels/usePetViewModel';
import { Colors } from '../styles/color';

export default function PetAddScreen() {

    const navigation = useNavigation();

    const { adicionarPet } =
        usePetViewModel();

    const { darkMode } =
        useTheme();

    const theme = darkMode
        ? Colors.dark
        : Colors.light;

    const [foto, setFoto] =
        useState('');

    const [nome, setNome] =
        useState('');

    const [raca, setRaca] =
        useState('');

    const [cor, setCor] =
        useState('');

    const [descricao, setDescricao] =
        useState('');

    const [sexo, setSexo] =
        useState<'MACHO' | 'FEMEA'>(
            'MACHO'
        );

    async function selecionarFoto() {

        const result =
            await ImagePicker.launchImageLibraryAsync({
                mediaTypes:
                    ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                allowsEditing: true,
                aspect: [1, 1]
            });

        if (!result.canceled) {
            setFoto(
                result.assets[0].uri
            );
        }
    }

    async function handleSalvar() {

        const sucesso =
            await adicionarPet(
                foto,
                nome,
                raca,
                cor,
                sexo,
                descricao
            );

        if (sucesso) {
            navigation.goBack();
        }
    }

    function SexoChip({
        label,
        value
    }: {
        label: string;
        value: 'MACHO' | 'FEMEA';
    }) {

        const selected =
            sexo === value;

        return (
            <Pressable
                style={[
                    styles.chip,
                    {
                        backgroundColor:
                            selected
                                ? Colors.brand.primaryBlue
                                : theme.surface,

                        borderColor:
                            selected
                                ? Colors.brand.primaryBlue
                                : theme.border
                    }
                ]}
                onPress={() =>
                    setSexo(value)
                }
            >
                <Text
                    style={[
                        styles.chipText,
                        {
                            color:
                                selected
                                    ? 'white'
                                    : theme.textSecondary
                        }
                    ]}
                >
                    {label}
                </Text>
            </Pressable>
        );
    }

    return (
        <SafeAreaView
            style={[
                styles.container,
                {
                    backgroundColor:
                        theme.background
                }
            ]}
        >
            <View
                style={[
                    styles.header,
                    {
                        backgroundColor:
                            theme.surface,

                        borderColor:
                            Colors.brand.primaryBlue
                    }
                ]}
            >
                <Pressable
                    onPress={() =>
                        navigation.goBack()
                    }
                >
                    <Text
                        style={
                            styles.btnVoltar
                        }
                    >
                        ← Voltar
                    </Text>
                </Pressable>

                <Text
                    style={[
                        styles.title,
                        {
                            color:
                                theme.textPrimary
                        }
                    ]}
                >
                    Novo Pet
                </Text>
            </View>

            <ScrollView
                contentContainerStyle={
                    styles.content
                }
            >
                <Text
                    style={
                        styles.sectionTitle
                    }
                >
                    Foto do Pet
                </Text>

                <Pressable
                    style={[
                        styles.imageButton,
                        {
                            borderColor:
                                theme.border
                        }
                    ]}
                    onPress={
                        selecionarFoto
                    }
                >
                    {foto ? (
                        <Image
                            source={{
                                uri: foto
                            }}
                            style={
                                styles.preview
                            }
                        />
                    ) : (
                        <Text
                            style={{
                                color:
                                    theme.textSecondary
                            }}
                        >
                            Selecionar Foto
                        </Text>
                    )}
                </Pressable>

                <Text
                    style={[
                        styles.label,
                        {
                            color:
                                theme.textPrimary
                        }
                    ]}
                >
                    Nome
                </Text>

                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor:
                                theme.surface,
                            color:
                                theme.textPrimary,
                            borderColor:
                                theme.border
                        }
                    ]}
                    value={nome}
                    onChangeText={setNome}
                    placeholder="Nome do Pet"
                    placeholderTextColor={
                        theme.textSecondary
                    }
                />

                <Text
                    style={[
                        styles.label,
                        {
                            color:
                                theme.textPrimary
                        }
                    ]}
                >
                    Raça
                </Text>

                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor:
                                theme.surface,
                            color:
                                theme.textPrimary,
                            borderColor:
                                theme.border
                        }
                    ]}
                    value={raca}
                    onChangeText={setRaca}
                    placeholder="Raça"
                    placeholderTextColor={
                        theme.textSecondary
                    }
                />

                <Text
                    style={[
                        styles.label,
                        {
                            color:
                                theme.textPrimary
                        }
                    ]}
                >
                    Cor
                </Text>

                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor:
                                theme.surface,
                            color:
                                theme.textPrimary,
                            borderColor:
                                theme.border
                        }
                    ]}
                    value={cor}
                    onChangeText={setCor}
                    placeholder="Cor"
                    placeholderTextColor={
                        theme.textSecondary
                    }
                />

                <Text
                    style={[
                        styles.label,
                        {
                            color:
                                theme.textPrimary
                        }
                    ]}
                >
                    Sexo
                </Text>

                <View
                    style={
                        styles.chipContainer
                    }
                >
                    <SexoChip
                        label="Macho"
                        value="MACHO"
                    />

                    <SexoChip
                        label="Fêmea"
                        value="FEMEA"
                    />
                </View>

                <Text
                    style={[
                        styles.label,
                        {
                            color:
                                theme.textPrimary
                        }
                    ]}
                >
                    Descrição
                </Text>

                <TextInput
                    multiline
                    numberOfLines={4}
                    value={descricao}
                    onChangeText={
                        setDescricao
                    }
                    style={[
                        styles.textArea,
                        {
                            backgroundColor:
                                theme.surface,
                            color:
                                theme.textPrimary,
                            borderColor:
                                theme.border
                        }
                    ]}
                    placeholder="Descrição geral do animal"
                    placeholderTextColor={
                        theme.textSecondary
                    }
                />

                <Pressable
                    style={
                        styles.btnSalvar
                    }
                    onPress={
                        handleSalvar
                    }
                >
                    <Text
                        style={
                            styles.btnSalvarText
                        }
                    >
                        Cadastrar Pet
                    </Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },

    header: {
        padding: 20,
        borderBottomWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },

    btnVoltar: {
        color: Colors.brand.primaryBlue,
        fontFamily: 'Inter-Bold',
        fontSize: 16
    },

    title: {
        fontSize: 20,
        fontFamily: 'Inter-Bold'
    },

    content: {
        padding: 20,
        paddingBottom: 40
    },

    sectionTitle: {
        fontSize: 18,
        marginBottom: 15,
        color: Colors.brand.primaryOrange,
        fontFamily: 'Inter-Bold'
    },

    imageButton: {
        width: 150,
        height: 150,
        borderWidth: 1,
        borderRadius: 75,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
        overflow: 'hidden'
    },

    preview: {
        width: '100%',
        height: '100%'
    },

    label: {
        fontSize: 14,
        marginBottom: 8,
        fontFamily: 'Inter-Bold'
    },

    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        fontFamily: 'Inter-Regular'
    },

    textArea: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 15,
        height: 120,
        textAlignVertical: 'top',
        marginBottom: 20,
        fontFamily: 'Inter-Regular'
    },

    chipContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20
    },

    chip: {
        borderWidth: 1,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10
    },

    chipText: {
        fontFamily: 'Inter-Bold'
    },

    btnSalvar: {
        backgroundColor:
            Colors.brand.primaryBlue,

        padding: 18,

        borderRadius: 8,

        alignItems: 'center'
    },

    btnSalvarText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Inter-Bold'
    }
});