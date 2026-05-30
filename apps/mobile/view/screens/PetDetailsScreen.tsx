import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PetStackParamList } from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import { usePetViewModel } from '../../viewmodels/usePetViewModel';

import { Colors } from '../styles/color';

type PetDetailsRouteProp =
    RouteProp<PetStackParamList, 'PetDetails'>;

export default function PetDetailsScreen() {

    const navigation = useNavigation();

    const route =
        useRoute<PetDetailsRouteProp>();

    const { petId } = route.params;

    const {
        getPetById,
        atualizarPet,
        excluirPet
    } = usePetViewModel();

    const { darkMode } =
        useTheme();

    const theme = darkMode
        ? Colors.dark
        : Colors.light;

    const pet =
        getPetById(petId);

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

    useEffect(() => {

        if (pet) {

            setFoto(
                pet.foto || ''
            );

            setNome(
                pet.nome
            );

            setRaca(
                pet.raca
            );

            setCor(
                pet.cor
            );

            setSexo(
                pet.sexo
            );

            setDescricao(
                pet.descricao
            );
        }

    }, [pet]);

    if (!pet) {
        return (
            <SafeAreaView>
                <Text>
                    Pet não encontrado.
                </Text>
            </SafeAreaView>
        );
    }

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

        await atualizarPet(
            petId,
            foto,
            nome,
            raca,
            cor,
            sexo,
            descricao
        );

        navigation.goBack();
    }

    function handleExcluir() {

        Alert.alert(
            'Excluir Pet',
            'Deseja realmente excluir este pet?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {

                        await excluirPet(
                            petId
                        );

                        navigation.goBack();
                    }
                }
            ]
        );
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
                    Editar Pet
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
                    value={nome}
                    onChangeText={setNome}
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
                    value={raca}
                    onChangeText={setRaca}
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
                    value={cor}
                    onChangeText={setCor}
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
                        Salvar Alterações
                    </Text>
                </Pressable>

                <View
                    style={
                        styles.divider
                    }
                />

                <Pressable
                    style={
                        styles.btnExcluir
                    }
                    onPress={
                        handleExcluir
                    }
                >
                    <Text
                        style={
                            styles.btnExcluirText
                        }
                    >
                        Excluir Pet
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
        fontSize: 16,
        fontFamily: 'Inter-Bold'
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
        borderRadius: 75,
        borderWidth: 1,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: 25
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
        backgroundColor: Colors.brand.primaryBlue,
        padding: 18,
        borderRadius: 8,
        alignItems: 'center'
    },

    btnSalvarText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Inter-Bold'
    },

    divider: {
        height: 1,
        backgroundColor: Colors.brand.secondaryOrange,
        marginVertical: 25
    },

    btnExcluir: {
        backgroundColor: '#fee2e2',
        borderWidth: 1,
        borderColor: '#ef4444',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center'
    },

    btnExcluirText: {
        color: '#ef4444',
        fontSize: 16,
        fontFamily: 'Inter-Bold'
    }
});