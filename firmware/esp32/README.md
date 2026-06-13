# Firmware ESP32-C3 SuperMini

`find_mypet_tracker/find_mypet_tracker.ino` é o firmware ESP32-C3 SuperMini usado pelo rastreador do Find MyPet.

Responsabilidades principais:

- conectar ao Wi-Fi;
- ler o nível de bateria via ADC;
- comunicar com o módulo GNSS/4G pela `Serial1`;
- buscar configurações do dispositivo na API;
- enviar localização e bateria para a API;
- expor um painel web local para comandos AT e depuração.

Antes de gravar na placa, configure `SSID`, `password`, `SERIAL_NUMBER` e `API_BASE_URL` conforme o ambiente local. Não versionar credenciais reais de Wi-Fi.
