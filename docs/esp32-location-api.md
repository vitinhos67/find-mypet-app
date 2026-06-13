# ESP32 — Comunicação HTTP do Rastreador

Este documento descreve o fluxo HTTP REST usado pelo firmware do ESP32-C3 SuperMini no Find MyPet.

Firmware atual:

```text
firmware/esp32/find_mypet_tracker/find_mypet_tracker.ino
```

O dispositivo se identifica pelo `SERIAL_NUMBER` configurado no firmware. Nas rotas abaixo, `{serial}` representa esse número de série.

## Fluxo

1. O ESP32 conecta ao Wi-Fi.
2. O ESP32 busca configurações atuais do dispositivo na API.
3. O ESP32 lê bateria via ADC.
4. O ESP32 envia localização e bateria para a API.
5. O aplicativo mobile consome os dados de dispositivo e localização pelos services do app.

## Buscar Configuração

```http
GET /api/hardware/{serial}/config
```

Resposta esperada:

```json
{
  "behavior_no_wifi": "RASTREIO_ATIVO",
  "wifi_ssid": "NomeDaRede",
  "wifi_password": "SenhaDaRede",
  "wake_interval": 1
}
```

Campos usados pelo firmware:

- `wifi_ssid`: rede Wi-Fi configurada para o dispositivo;
- `wifi_password`: senha da rede Wi-Fi;
- `behavior_no_wifi`: comportamento quando estiver fora da rede esperada;
- `wake_interval`: intervalo de envio/checagem configurado pelo app.

## Enviar Localização e Bateria

```http
POST /api/hardware/{serial}/location
```

Headers:

```http
Content-Type: application/json
```

Body enviado pelo ESP32:

```json
{
  "latitude": -21.1306,
  "longitude": -42.3643,
  "precision": 0,
  "battery_level": 85
}
```

Campos:

- `latitude`: latitude em graus decimais;
- `longitude`: longitude em graus decimais;
- `precision`: precisão informada pelo firmware;
- `battery_level`: nível de bateria calculado a partir da leitura ADC.

Resposta esperada em sucesso:

```http
201 Created
```

## Nota de Segurança

O fluxo atual de firmware/demo usa endpoints HTTP identificados pelo número de série do dispositivo. Para produção, o projeto deveria adicionar autenticação mais forte, TLS e/ou credenciais assinadas por dispositivo.

## Observação

A rota `POST /api/devices/{deviceId}/location` não é a rota ativa usada pelo firmware atual. O firmware usa as rotas `GET /api/hardware/{serial}/config` e `POST /api/hardware/{serial}/location`.
