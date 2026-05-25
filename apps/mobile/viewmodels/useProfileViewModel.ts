import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

import { supabase } from "../src/shared/lib/supabase";
import { ProfileService } from '../services/ProfileService';

type UsuarioType = {
    nome?: string;
    email?: string;
};

export function useProfileViewModel() {
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const [usuario, setUsuario] = useState<UsuarioType>({});

    useEffect(() => {
        carregarPerfil();
    }, []);

    async function carregarPerfil() {
        await carregarUsuario();
        await carregarImagem();
    }

    async function carregarUsuario() {
        try {
            const usuarioAtual =
                await ProfileService.carregarUsuarioAtual();
        
            if (!usuarioAtual) {
                return;
            }
        
            setUsuario(usuarioAtual);
        
        } catch (error) {
            console.log('Erro ao carregar usuário:', error);
        }
    }

    async function carregarImagem() {
        try {
            setProfileImage(null);

            const { data, error } = await supabase.auth.getUser();

            if (error) {
                console.log(
                    "Erro ao buscar usuário para imagem:",
                    error.message,
                );
                return;
            }

            const user = data.user;

            if (!user) {
                return;
            }

            const imagemSalva = await AsyncStorage.getItem(
                `@profile_image_${user.id}`,
            );

            if (imagemSalva) {
                setProfileImage(imagemSalva);
            }
        } catch (error) {
            console.log("Erro ao carregar imagem de perfil:", error);
            setProfileImage(null);
        }
    }

    async function salvarImagemPerfil(imagemUri: string) {
        try {
            const { data, error } = await supabase.auth.getUser();

            if (error) {
                console.log(
                    "Erro ao buscar usuário para salvar imagem:",
                    error.message,
                );
                return;
            }

            const user = data.user;

            if (!user) {
                return;
            }

            setProfileImage(imagemUri);

            await AsyncStorage.setItem(`@profile_image_${user.id}`, imagemUri);
        } catch (error) {
            console.log("Erro ao salvar imagem de perfil:", error);
        }
    }

    async function realizarLogout() {
        try {
            const { data } = await supabase.auth.getUser();

            if (data.user) {
                await AsyncStorage.removeItem(`@usuario_${data.user.id}`);
            }

            await AsyncStorage.removeItem("@usuario");
            await AsyncStorage.removeItem("@profile_image");
            await AsyncStorage.removeItem("@manter_conectado");

            const { error } = await supabase.auth.signOut();

            if (error) {
                console.log("Erro ao sair da conta:", error.message);
                return;
            }

            setUsuario({});
            setProfileImage(null);
        } catch (error) {
            console.log("Erro ao realizar logout:", error);
        }
    }

    return {
        usuario,
        profileImage,
        salvarImagemPerfil,
        realizarLogout,
    };
}
