# Find MyPet

Find MyPet é um projeto mobile-first para rastreamento de pets. A solução combina aplicativo mobile, API, Supabase, persistência local e firmware para rastreador ESP32-C3 SuperMini.

Este repositório representa uma entrega acadêmica de aplicativo mobile e robótica aplicada. Não deve ser tratado como produto pronto para produção.

## Módulos

- `apps/mobile`: aplicativo Expo React Native com TypeScript.
- `apps/api`: API Fastify com Node.js e TypeScript.
- `firmware`: firmware do rastreador ESP32-C3 SuperMini.
- `docs`: notas técnicas do projeto.

## Arquitetura

Fluxo principal:

```text
Mobile App -> Supabase Auth -> API -> Supabase Database
```

O aplicativo mobile usa Supabase Auth para autenticação e chama a API com token Bearer. Dados de perfil, pets, dispositivos e localização são consumidos pelo mobile por meio de `apps/mobile/src/services`.

O firmware se comunica com o sistema por endpoints HTTP REST de hardware. Ele busca configurações do dispositivo na API e envia dados de localização e bateria.

## Aplicativo Mobile

Destaques do app em `apps/mobile`:

- autenticação com Supabase Auth;
- estrutura inspirada em MVVM: `apps/mobile/src/view`, `apps/mobile/src/viewmodels`, `apps/mobile/src/services`, `apps/mobile/src/models`, `apps/mobile/src/database`, `apps/mobile/src/hooks` e `apps/mobile/src/navigation`;
- `AsyncStorage` para dados simples de sessão e preferências;
- SQLite para cache offline estruturado;
- fallback offline para perfil, pets, detalhe de pet e dispositivos;
- Context API e `useReducer` para controle de tema;
- recursos nativos: localização/GPS, galeria de imagens, mapas e SQLite.

## Firmware

O firmware em `firmware/esp32` é voltado ao ESP32-C3 SuperMini usado no rastreador.

Responsabilidades principais:

- conectar ao Wi-Fi;
- ler bateria por ADC;
- comunicar com módulo GNSS/4G pela `Serial1`;
- buscar configuração do dispositivo na API;
- enviar localização e bateria para a API;
- expor painel web local para comandos AT e depuração.

## Testes

O projeto mobile possui:

- testes unitários;
- testes de integração;
- testes de UI;
- testes de chamadas mobile/API nos services em `apps/mobile/src/services`;
- fluxos E2E em YAML para Maestro.

Os fluxos E2E exigem Maestro e um build de desenvolvimento ou standalone instalado em emulador/dispositivo com o app id configurado.

## Como Executar

### Mobile

```bash
cd apps/mobile
npm install
npx expo start
```

Validação mobile:

```bash
npm test -- --runInBand
npm run lint
npx tsc --noEmit
```

### API

```bash
cd apps/api
npm install
npm run dev
```

Testes da API:

```bash
npm test
```

## Documentação

- [Notas de localização ESP32](docs/esp32-location-api.md)
- [Fluxos E2E Maestro](apps/mobile/e2e/README.md)
- [Firmware ESP32](firmware/esp32/README.md)

## Limitações Conhecidas

- Os fluxos E2E foram preparados para Maestro, mas exigem configuração de emulador/dispositivo.
- O cache offline cobre dados centrais do mobile, mas histórico completo de localização e sincronização de escritas offline ainda não estão completos.
- A configuração entre firmware e API depende de valores locais de rede, como `API_BASE_URL`, Wi-Fi e serial do dispositivo.
