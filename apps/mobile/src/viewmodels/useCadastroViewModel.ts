import { useState } from 'react';
import { Alert } from 'react-native';
import { AuthService } from '../services/AuthService';

export function useCadastroViewModel() {
    const [isLoading, setIsLoading] = useState(false);

    async function realizarCadastro(
        nome: string,
        email: string,
        senha: string,
        confirmarSenha: string,
        telefone: string,
        genero: string 
    ) {
        if(genero === "Gênero"){
            Alert.alert('Atenção', 'Por favor, selecione um gênero.');
            return
        }
        if (!nome || !email || !senha || !confirmarSenha) {
            Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        if (senha !== confirmarSenha) {
            Alert.alert('Atenção', 'As senhas não coincidem. Digite novamente.');
            return;
        }
        if (senha.length < 6) {
            Alert.alert('Atenção', 'A senha deve ter no mínimo 6 caracteres.');
            return;
        }
        try {
            setIsLoading(true);
            await AuthService.cadastrar(email, senha, nome, telefone, genero);
            Alert.alert('Sucesso!', 'Conta criada com sucesso. Bem-vindo ao Find my PET!');

        } catch (error: any) {
            Alert.alert('Erro ao cadastrar', error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return {
        realizarCadastro,
        isLoading
    };
}