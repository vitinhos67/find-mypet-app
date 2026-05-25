import { useEffect, useState } from "react";

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

            const imagemSalva =
                await ProfileService.carregarImagemPerfil();

            if (imagemSalva) {
                setProfileImage(imagemSalva);
            }

        } catch (error) {
            console.log('Erro ao carregar imagem de perfil:', error);
            setProfileImage(null);
        }
    }

    async function salvarImagemPerfil(imagemUri: string) {
        try {
            setProfileImage(imagemUri);
        
            await ProfileService.salvarImagemPerfil(imagemUri);
        
        } catch (error) {
            console.log('Erro ao salvar imagem de perfil:', error);
        }
    }

    async function realizarLogout() {
        try {
            await ProfileService.realizarLogout();

            setUsuario({});
            setProfileImage(null);

        } catch (error) {
            console.log('Erro ao realizar logout:', error);
        }
    }

    return {
        usuario,
        profileImage,
        salvarImagemPerfil,
        realizarLogout,
    };
}
