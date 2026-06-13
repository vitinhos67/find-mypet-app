# Testes E2E com Maestro

Estes fluxos cobrem jornadas não autenticadas e não dependem de credenciais reais ou dados semeados.

## Pré-requisitos

- Maestro instalado na máquina local.
- Aplicativo instalado e aberto pelo emulador/dispositivo com `appId` `com.findmypet.app`.
- Build de desenvolvimento ou standalone gerado com os identificadores de `apps/mobile/app.json`.

Se o app estiver rodando pelo Expo Go, o `appId` do Expo Go é diferente. Nesse caso, use um build de desenvolvimento para manter os seletores e o `appId` estáveis.

## Comandos

```bash
maestro test apps/mobile/e2e/login-invalid.yaml
maestro test apps/mobile/e2e/create-account-navigation.yaml
```

## Fluxos

- `login-invalid.yaml`: abre o app, preenche credenciais inválidas, toca em `Entrar` e confirma que a tela de login continua visível.
- `create-account-navigation.yaml`: abre o app, navega para `Criar conta`, confirma a tela de cadastro e volta para login.
