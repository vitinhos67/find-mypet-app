#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WebServer.h>

// ==========================================
// ⚙️ CONFIGURAÇÕES DA PLACA e PINOS
// ==========================================
const String SERIAL_NUMBER = "FMP26NUUL6"; 
const String API_BASE_URL = "http://10.0.0.192:3333/api/hardware/";

#define RX_PIN 20
#define TX_PIN 21
#define GPS_BAUD 115200
#define BATT_ADC_PIN 0 // Pino analógico da bateria (GPIO0)

// Wi-Fi de "Resgate" / Base
String ssidAtual = "XXXXXX"; 
String senhaAtual = "XXXXXXXX";

// Variáveis dinâmicas da Máquina de Estados
String modoComportamento = "RASTREIO_ATIVO";
unsigned long intervaloEnvio = 15000; 
unsigned long intervaloMinutosDoApp = 60000; // Começa com 1 min padrão
unsigned long ultimoCiclo = 0;

// Variáveis do Painel Web Interativo
WebServer server(80);
String logModulo = ""; 

void setup() {
  Serial.begin(115200);
  Serial1.begin(GPS_BAUD, SERIAL_8N1, RX_PIN, TX_PIN);
  analogReadResolution(12); 
  analogSetPinAttenuation(0, ADC_11db); // Abre a escala para ler até 3.3V no A0
  
  delay(2000);
  Serial.println("\n\n===========================================");
  Serial.println("   INICIANDO FIRMWARE MESTRE FIND MY PET   ");
  Serial.println("===========================================");

  Serial1.println("AT+CGNSSPWR=1");
  delay(500);

  conectarWiFi(ssidAtual, senhaAtual);
  buscarConfiguracoesNaAPI();

  // --- CONFIGURAÇÃO DO SERVIDOR WEB ---
  server.on("/", []() {
    String html = "<html><head><meta name='viewport' content='width=device-width, initial-scale=1'>";
    html += "<meta http-equiv='refresh' content='7'>"; 
    html += "<title>TCC - Monitor A7680C</title></head><body style='font-family: Arial; padding: 15px; background: #f8f9fa;'>";
    html += "<h2>Painel de Controle do Rastreador (ESP32-C3)</h2>";
    html += "<p><b>Status Atual no Banco:</b> <span style='color:green; font-weight:bold;'>" + modoComportamento + "</span></p>";
    html += "<p><b>Intervalo de Sono Atual:</b> " + String(intervaloMinutosDoApp / 60000) + " minuto(s)</p>";
    
    html += "<div style='background:#e9ecef; padding:15px; border-radius:8px; margin-bottom:15px;'>";
    html += "<form action='/comando' method='GET'>";
    html += "<label><b>Enviar Comando AT para o Módulo 4G/GNSS:</b></label><br>";
    html += "<input type='text' name='at' placeholder='Ex: AT+CGNSSINFO' style='width:65%; padding:10px; margin-top:8px; border:1px solid #ccc; border-radius:4px;'> ";
    html += "<input type='submit' value='Enviar' style='padding:10px 15px; background:#28a745; color:white; border:none; border-radius:4px; cursor:pointer;'>";
    html += "</form></div>";

    html += "<p><b>Log de Comunicação Serial (Auto-atualiza):</b></p>";
    html += "<textarea rows='12' style='width:100%; font-family: monospace; background:#222; color:#0f0; padding:10px; border-radius:5px Papel;'>" + logModulo + "</textarea>";
    html += "</body></html>";
    
    server.send(200, "text/html", html);
    if (logModulo.length() > 2000) logModulo = ""; 
  });

  server.on("/comando", []() {
    if (server.hasArg("at")) {
      String cmd = server.arg("at");
      cmd.toUpperCase(); 
      while(Serial1.available()) Serial1.read(); 
      Serial1.println(cmd); 
      delay(800); 
      
      String resposta = "";
      while (Serial1.available()) {
        char c = Serial1.read();
        resposta += c;
      }
      
      String html = "<html><head><meta name='viewport' content='width=device-width, initial-scale=1'><title>Resposta AT</title></head><body style='font-family: Arial; padding: 20px;'>";
      html += "<h3 style='color:#007bff;'>Comando Executado: " + cmd + "</h3>";
      html += "<b>Retorno do Hardware:</b>";
      html += "<pre style='background:#f4f4f4; padding:15px; border:1px solid #ddd; border-radius:5px; font-size:16px;'>" + (resposta.length() > 0 ? resposta : "Sem resposta do modulo.") + "</pre>";
      html += "<br><a href='/' style='padding: 10px 20px; background: #6c757d; color: white; text-decoration: none; border-radius: 5px;'>Voltar ao Painel</a>";
      html += "</body></html>";
      
      server.send(200, "text/html", html);
    }
  });

  server.begin();
  Serial.println("[HTTP_SERVER] Servidor interno do ESP32 pronto!");
}

void loop() {
  server.handleClient();

  while (Serial1.available()) {
    char c = Serial1.read();
    logModulo += c;
  }

  // Máquina de estados baseada em tempo dinâmico
  if (millis() - ultimoCiclo >= intervaloEnvio) {
    ultimoCiclo = millis();

    //  LOG DETALHADO NO MONITOR SERIAL DO ARDUINO IDE
    Serial.println("\n=======================================================");
    Serial.println("[CICLO] ️ EXECUTANDO ROTINA DE RASTREAMENTO INTELIGENTE");
    Serial.println("=======================================================");
    Serial.println("-> Modo de Operacao Atual: " + modoComportamento);
    
    int bateriaReal = lerBateria(); 

    // Define as coordenadas de teste para o log saber o que está viajando
    float latTeste = -21.1306;
    float lngTeste = -42.3643;

    if (modoComportamento == "RASTREIO_ATIVO") {
        Serial.println("-> ACAO DETECTADA: [RASTREIO ATIVO]");
        Serial.println("   -> Descricao: Pet fora de casa. Enviando localizacao de 15 em 15 segundos.");
        Serial.printf("   -> Dados a Enviar: Lat: %.4f | Lng: %.4f | Bat: %d%%\n", latTeste, lngTeste, bateriaReal);
        
        intervaloEnvio = 15000; // Garante o tempo de 15s
        enviarLocalizacao(latTeste, lngTeste, bateriaReal);
    } 
    else if (modoComportamento == "PEGAR_LOCAL_E_DORMIR") {
        int minutos = intervaloMinutosDoApp / 60000;
        Serial.println("-> ACAO DETECTADA: [PEGAR LOCAL E DORMIR]");
        Serial.printf("   -> Descricao: Modo Economia Maxima ativado pelo Dono no App.\n");
        Serial.printf("   -> Configurado para acordar apenas de %d em %d minuto(s).\n", minutos, minutos);
        Serial.printf("   -> Dados a Enviar: Lat: %.4f | Lng: %.4f | Bat: %d%%\n", latTeste, lngTeste, bateriaReal);
        
        intervaloEnvio = intervaloMinutosDoApp; // Aplica o tempo dinâmico do banco (ex: 2 ou 3 min)
        enviarLocalizacao(latTeste, lngTeste, bateriaReal);
        
        Serial.println("   -> [HARDWARE] Desligando perifericos (GNSS/4G) e entrando em Standby...");
    } 
    else if (modoComportamento == "IGNORAR" || modoComportamento == "MANUAL") {
        Serial.println("-> ACAO DETECTADA: [MODO MANUAL / IGNORAR]");
        Serial.println("   -> Descricao: O rastreamento automatico foi pausado.");
        Serial.println("   -> Nenhuma coordenada enviada para poupar totalmente dados e bateria.");
        Serial.println("   -> [TIMER] ESP32 acordara em 30 segundos apenas para checar o banco.");
        
        intervaloEnvio = 30000; 
    } 
    else if (modoComportamento == "PERGUNTAR") {
        Serial.println("-> ACAO DETECTADA: [MODO PERGUNTAR]");
        Serial.println("   -> Descricao: Aguardando interacao ou disparando ping de checagem.");
        intervaloEnvio = 30000; 
    }

    // Após processar o comportamento, busca se houve alteração no app para o próximo ciclo
    buscarConfiguracoesNaAPI();
    Serial.println("=======================================================\n");
  }
}

// ==========================================
//  LOG DA BATERIA REAL DE BANCADA
// ==========================================
int lerBateria() {
  int valorADC = analogRead(BATT_ADC_PIN);
  
  int adcMinimo = 2100; 
  int adcMaximo = 2800; 

  int porcentagem = map(valorADC, adcMinimo, adcMaximo, 0, 100);
  porcentagem = constrain(porcentagem, 0, 100);

  float tensaoPino = (valorADC / 4095.0) * 3.3; 
  float tensaoBateriaCaculada = tensaoPino * 2.0; 

  Serial.printf("   -> [HARDWARE] ADC Bruto: %d | Tensao Estimada: %.2fV | Nivel Calculado: %d%%\n", valorADC, tensaoBateriaCaculada, porcentagem);
  return porcentagem;
}

// ==========================================
//  COMUNICAÇÃO WI-FI E API PACKETS
// ==========================================
void conectarWiFi(String rede, String senha) {
  Serial.println("\n[WIFI] Tentando conectar na rede: " + rede);
  WiFi.mode(WIFI_STA);
  WiFi.begin(rede.c_str(), senha.c_str());
  WiFi.setTxPower(WIFI_POWER_8_5dBm);

  int tentativas = 0;
  while (WiFi.status() != WL_CONNECTED && tentativas < 15) {
    delay(500);
    Serial.print(".");
    tentativas++;
  }

  if(WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WIFI] Conectado com sucesso!");
    Serial.print(" ACESSE O PAINEL WEB PELO IP: http://");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WIFI] Falha na conexao.");
  }
}

void buscarConfiguracoesNaAPI() {
  if (WiFi.status() != WL_CONNECTED) return;

  Serial.println("   -> [API] Sincronizando novas configuracoes com o banco...");
  HTTPClient http;
  http.setReuse(false); 
  String urlConfig = API_BASE_URL + SERIAL_NUMBER + "/config";
  http.begin(urlConfig);
  http.setTimeout(5000);
  
  int code = http.GET();
  if (code == 200) {
    String payload = http.getString();
    DynamicJsonDocument doc(512);
    deserializeJson(doc, payload);

    String novoComportamento = doc["behavior_no_wifi"].as<String>();
    String novoWifi = doc["wifi_ssid"].as<String>();
    String novaSenha = doc["wifi_password"].as<String>();
    int intervalo = doc["wake_interval"].as<int>(); 

    //  SÓ ADICIONAR ESTE BLOCO AQUI PARA MOSTRAR NA TELA:
    Serial.println("      ---------------------------------------");
    Serial.println("       PREFERENCIAS ATUAIS DO USUARIO:");
    Serial.println("      - Comportamento: " + novoComportamento);
    Serial.printf("      - Tempo (minutos): %d\n", intervalo);
    Serial.println("      ---------------------------------------");

    if (intervalo > 0) {
        intervaloMinutosDoApp = intervalo * 60000;
    }

    if (novoComportamento != "null" && novoComportamento != "") {
      modoComportamento = novoComportamento;
    }

    if (novoWifi != "null" && novoWifi != "" && novoWifi != ssidAtual) {
      Serial.println("   ⚠️ [WIFI_MIGRATION] Novo SSID configurado via aplicativo!");
      ssidAtual = novoWifi;
      senhaAtual = novaSenha;
      WiFi.disconnect();
      conectarWiFi(ssidAtual, senhaAtual);
    }
  }
  http.end();
}

void enviarLocalizacao(float lat, float lng, int nivelBateria) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.setReuse(false);
  String urlLocation = API_BASE_URL + SERIAL_NUMBER + "/location";
  http.begin(urlLocation);
  http.setTimeout(8000);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["latitude"] = lat;
  doc["longitude"] = lng;
  doc["precision"] = (modoComportamento == "PEGAR_LOCAL_E_DORMIR") ? 999 : 0; 
  doc["battery_level"] = nivelBateria; 

  String requestBody;
  serializeJson(doc, requestBody);

  int code = http.POST(requestBody);
  if (code == 201) {
    Serial.println("   -> [HTTP]  Sucesso: Dados transmitidos para o Supabase.");
  } else {
    Serial.printf("   -> [HTTP]  Erro %d ao transmitir dados.\n", code);
  }
  http.end();
}
