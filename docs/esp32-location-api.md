# ESP32 — Envio de Localização GPS

Este documento descreve como o firmware do ESP32 deve enviar a posição GPS para a API do Find My Pet.

---

## Endpoint

```
POST /api/devices/{deviceId}/location
```

- `{deviceId}` — UUID do dispositivo (coleira), cadastrado previamente no banco.
- **Não requer autenticação** — o device ID já identifica a coleira.

---

## Requisição

### Headers

```
Content-Type: application/json
```

### Body (JSON)

| Campo       | Tipo             | Obrigatório | Descrição                                    |
| ----------- | ---------------- | ----------- | -------------------------------------------- |
| `latitude`  | `number`         | Sim         | Latitude em graus decimais (ex: `-23.5505`)  |
| `longitude` | `number`         | Sim         | Longitude em graus decimais (ex: `-46.6333`) |
| `precision` | `number \| null` | Não         | Precisão do GPS em metros (ex: `5.2`)        |

**Exemplo:**

```json
{
  "latitude": -23.5505,
  "longitude": -46.6333,
  "precision": 4.8
}
```

---

## Resposta de Sucesso

**HTTP 201 Created**

```json
{
  "success": true,
  "data": {
    "deviceId": "uuid-do-device",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "precision": 4.8,
    "updatedAt": "2026-06-01T12:00:00.000Z"
  },
  "message": "Localização salva com sucesso."
}
```

---

## Comportamento Interno

1. A API recebe as coordenadas do device.
2. Busca o `pet_id` atualmente vinculado ao device na tabela `devices`.
3. Insere um novo registro em `device_locations` com `device_id`, `pet_id` (pode ser `null` se a coleira não estiver vinculada a um pet) e as coordenadas.
4. O campo `recorded_at` é preenchido automaticamente com o timestamp do servidor (`now()`).

> Isso garante que o histórico de localização por pet seja preciso mesmo quando uma coleira é transferida entre pets.

## Notas

- O `deviceId` deve estar cadastrado na tabela `devices` antes do primeiro envio.
- Se o device não estiver vinculado a nenhum pet, a localização é salva com `pet_id = null` — útil para testes de hardware.
- A precisão (`precision`) é opcional, mas recomendada para filtrar leituras ruins do GPS.
- Recomenda-se enviar apenas quando o GPS tiver um fix válido (HDOP aceitável).
