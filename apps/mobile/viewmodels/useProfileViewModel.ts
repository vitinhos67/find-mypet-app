import { useEffect, useState } from "react";

import { UserProfile } from '../models/profile.model';
import { ProfileService } from '../services/ProfileService';

const GENEROS_PERMITIDOS = ['Masculino', 'Feminino', 'Outro'];

export function useProfileViewModel() {
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const [usuario, setUsuario] = useState<Partial<UserProfile>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [genero, setGenero] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        carregarPerfil();
    }, []);

    function preencherFormulario(usuarioAtual: Partial<UserProfile>) {
        setNome(usuarioAtual.nome || '');
        setTelefone((usuarioAtual.telefone || '').replace(/\D/g, '').slice(0, 11));
        setGenero(usuarioAtual.genero || '');
    }

    function atualizarTelefone(valor: string) {
        setTelefone(valor.replace(/\D/g, '').slice(0, 11));
    }

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
            preencherFormulario(usuarioAtual);

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

    function iniciarEdicao() {
        preencherFormulario(usuario);
        setMessage(null);
        setErrorMessage(null);
        setIsEditing(true);
    }

    function cancelarEdicao() {
        preencherFormulario(usuario);
        setMessage(null);
        setErrorMessage(null);
        setIsEditing(false);
    }

    async function salvarPerfil() {
        const nomeFormatado = nome.trim();

        if (nomeFormatado.length < 2) {
            setErrorMessage('Informe um nome com pelo menos 2 caracteres.');
            return false;
        }

        if (telefone && telefone.length !== 11) {
            setErrorMessage('Informe o telefone com DDD e 9 números.');
            return false;
        }

        if (genero && !GENEROS_PERMITIDOS.includes(genero)) {
            setErrorMessage('Selecione um gênero válido.');
            return false;
        }

        try {
            setIsSaving(true);
            setMessage(null);
            setErrorMessage(null);

            const usuarioAtualizado = await ProfileService.atualizarPerfil({
                nome: nomeFormatado,
                telefone: telefone.trim() || null,
                genero: genero.trim() || null,
                avatarUrl: usuario.avatarUrl || null,
            });

            setUsuario(usuarioAtualizado);
            preencherFormulario(usuarioAtualizado);
            setIsEditing(false);
            setMessage('Perfil atualizado com sucesso.');

            return true;

        } catch (error: any) {
            setErrorMessage(error.message || 'Não foi possível atualizar o perfil.');
            return false;

        } finally {
            setIsSaving(false);
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
        isEditing,
        isSaving,
        nome,
        telefone,
        genero,
        message,
        errorMessage,
        setNome,
        setTelefone: atualizarTelefone,
        setGenero,
        iniciarEdicao,
        cancelarEdicao,
        salvarPerfil,
        salvarImagemPerfil,
        realizarLogout,
    };
}
