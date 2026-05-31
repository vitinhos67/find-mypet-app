import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import {
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PetStackParamList } from '../../navigation/types';
import { usePetViewModel } from '../../viewmodels/usePetViewModel';

import { useTheme } from '../../hooks/useTheme';
import { Colors } from '../styles/color';
;

type NavigationProp =
    NativeStackNavigationProp<
        PetStackParamList,
        'PetList',
        'Colar'
    >;

export default function PetListScreen() {

    const navigation =
        useNavigation<NavigationProp>();

    const { pets, carregarPets } =
        usePetViewModel();

    const { darkMode } = useTheme();

    const theme = darkMode
        ? Colors.dark
        : Colors.light;

    useFocusEffect(
        useCallback(() => {
            carregarPets();
        }, [carregarPets])
    );

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
                    }
                ]}
            >
                <View>
                    <Text
                        style={[
                            styles.title,
                            {
                                color:
                                    Colors.brand.primaryBlue
                            }
                        ]}
                    >
                        Meus Pets
                    </Text>

                    <Text
                        style={[
                            styles.subtitle,
                            {
                                color:
                                    theme.textSecondary
                            }
                        ]}
                    >
                        Gerencie seus animais
                    </Text>
                </View>

                <View style={{ flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
                    <Pressable
                        style={styles.btnAdd}
                        onPress={() =>
                            navigation.navigate(
                                'PetAdd'
                            )
                        }
                    >
                        <Text
                            style={styles.btnAddText}
                        >
                            + Novo
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.btnAdd, { backgroundColor: Colors.brand.primaryBlue }]}
                        onPress={() => navigation.navigate('Collar' as any)}
                    >
                        <Text style={styles.btnAddText}>
                            Coleiras
                        </Text>
                    </Pressable>
                </View>
            </View>

            <FlatList
                data={pets}
                keyExtractor={(item) => item.id}
                contentContainerStyle={
                    styles.listContainer
                }
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.card,
                            {
                                backgroundColor:
                                    theme.surface
                            }
                        ]}
                    >
                        <View
                            style={styles.cardInfo}
                        >
                            {item.foto ? (
                                <Image
                                    source={{
                                        uri: item.foto
                                    }}
                                    style={
                                        styles.petImage
                                    }
                                />
                            ) : (
                                <View
                                    style={[
                                        styles.placeholder,
                                        {
                                            backgroundColor:
                                                theme.border
                                        }
                                    ]}
                                >
                                    <Text
                                        style={
                                            styles.placeholderText
                                        }
                                    >
                                        🐾
                                    </Text>
                                </View>
                            )}

                            <View
                                style={
                                    styles.textContainer
                                }
                            >
                                <Text
                                    style={[
                                        styles.nomeText,
                                        {
                                            color:
                                                theme.textPrimary
                                        }
                                    ]}
                                >
                                    {item.nome}
                                </Text>

                                <Text
                                    style={[
                                        styles.racaText,
                                        {
                                            color:
                                                theme.textSecondary
                                        }
                                    ]}
                                >
                                    {item.raca}
                                </Text>
                            </View>
                        </View>

                        <Pressable
                            style={
                                styles.btnDetalhes
                            }
                            onPress={() =>
                                navigation.navigate(
                                    'PetDetails',
                                    {
                                        petId:
                                            item.id
                                    }
                                )
                            }
                        >
                            <Text
                                style={
                                    styles.btnDetalhesText
                                }
                            >
                                Detalhes
                            </Text>
                        </Pressable>
                    </View>
                )}
                ListEmptyComponent={
                    <Text
                        style={[
                            styles.emptyText,
                            {
                                color:
                                    theme.textSecondary
                            }
                        ]}
                    >
                        Nenhum pet cadastrado.
                    </Text>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },

    header: {
        padding: 20,
        flexDirection: 'row',
        justifyContent:
            'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: Colors.brand.primaryOrange
    },

    title: {
        fontSize: 20,
        fontFamily: 'Inter-Bold'
    },

    subtitle: {
        fontSize: 14,
        marginTop: 4,
        fontFamily: 'Inter-Regular'
    },

    btnAdd: {
        backgroundColor:
            Colors.brand.primaryOrange,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8
    },

    btnAddText: {
        color: 'white',
        fontFamily: 'Inter-Bold'
    },

    listContainer: {
        padding: 20,
        gap: 15
    },

    card: {
        padding: 16,
        borderRadius: 12,

        flexDirection: 'row',

        justifyContent:
            'space-between',

        alignItems: 'center',

        elevation: 2
    },

    cardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },

    petImage: {
        width: 70,
        height: 70,
        borderRadius: 35
    },

    placeholder: {
        width: 70,
        height: 70,
        borderRadius: 35,

        justifyContent: 'center',
        alignItems: 'center'
    },

    placeholderText: {
        fontSize: 24
    },

    textContainer: {
        marginLeft: 12
    },

    nomeText: {
        fontSize: 16,
        fontFamily: 'Inter-Bold'
    },

    racaText: {
        fontSize: 14,
        marginTop: 4,
        fontFamily: 'Inter-Regular'
    },

    btnDetalhes: {
        backgroundColor:
            Colors.brand.primaryBlue,

        paddingVertical: 8,
        paddingHorizontal: 16,

        borderRadius: 8
    },

    btnDetalhesText: {
        color: 'white',
        fontFamily: 'Inter-Bold'
    },

    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontFamily: 'Inter-Regular'
    }
});