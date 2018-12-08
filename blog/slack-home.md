---
title: お家の状況監視システムを作ろう！！
date: 2018-12-08 23:43:55
description: "我が家ではお家の状況をいつでもどこでも見たり、操作できるような**お家の状況監視システム**を完成させるべく日々お家ハックに勤しんでおります。そんな中で作ったものを今回はご紹介します。"
image: "https://4.bp.blogspot.com/-P1l2o2XZLeo/V8PYwYbIVRI/AAAAAAAA9UI/XvDaA3e0NYcwM6tuUVsGPaPDQF9TUlfHwCLcB/s800/window_amado_open.png"
slug: forth
---
## お家の状況監視システムを作ろう！！

我が家ではお家の状況をいつでもどこでも見たり、操作できるような**お家の状況監視システム**を完成させるべく日々お家ハックに勤しんでおります。そんな中で作ったものを今回はご紹介します。

---

### Slackでお家のことを見守る君

Slackでお家のことを見守るシステム群です。Slackからお家の状態（温度とか色々）確認したい時ってありますよね？ そんな思いを実現するツールたちです。

#### 温度・湿度確認君

Slackで「温度」または「湿度」と書き込むとBotが温度か湿度を返してくれるという超絶便利な機能です。百聞は一見に如かず。ご覧ください。

![slack_home](../static/images/slack_home.gif)

いやー！超絶便利ですね！

#### 作り方

それでは温度・湿度確認君の作り方を解説します。

#### 準備するもの

ほとんど中華通販サイトから調達できます。

- [D1 mini](https://wiki.wemos.cc/products:d1:d1_mini)
    - いわゆるESP8266モジュールです
- [DHT Shield](https://wiki.wemos.cc/products:d1_mini_shields:dht_shield)
    - D1 mini専用のDHT12を搭載したシールドです
- Broadlink RM 3 Mini (aka Black Bean)
    - 通称「黒豆」AliExpressとかで売ってると思います
- Raspberry Pi 3
    - SlackのBotとBroadlink RM 3 Miniを操作するためのサーバーとして利用します。後述するpythonのslackbotライブラリとBlackBeanControlが動くマシンであればなんでもいいと思います。

#### 作ってみる
それでは準備したものを使って作ってみましょう。まず、D1 miniとDHT Shieldをはんだ付けして温度・湿度取得モジュールを作成します。できたらArduino ÎDEでプログラムを流し込みましょう。ソースは以下のものを使っています。
``` C
/* WeMos DHT Server
 *
 * Connect to WiFi and respond to http requests with temperature and humidity
 *
 * Based on Adafruit ESP8266 Temperature / Humidity Webserver
 * https://learn.adafruit.com/esp8266-temperature-slash-humidity-webserver
 *
 * Depends on Adafruit DHT Arduino library
 * https://github.com/adafruit/DHT-sensor-library
 */

#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <DHT.h>

#define DHTTYPE DHT11   // DHT Shield uses DHT 11
#define DHTPIN D4       // DHT Shield uses pin D4

// Existing WiFi network
const char* ssid     = "YourRouterSSID";
const char* password = "YourRouterPassword";

// Listen for HTTP requests on standard port 80
ESP8266WebServer server(80);

// Initialize DHT sensor
// Note that older versions of this library took an optional third parameter to
// tweak the timings for faster processors.  This parameter is no longer needed
// as the current DHT reading algorithm adjusts itself to work on faster procs.
DHT dht(DHTPIN, DHTTYPE);

float humidity, temperature;                 // Raw float values from the sensor
char str_humidity[10], str_temperature[10];  // Rounded sensor values and as strings
// Generally, you should use "unsigned long" for variables that hold time
unsigned long previousMillis = 0;            // When the sensor was last read
const long interval = 2000;                  // Wait this long until reading again

void handle_root() {
  server.send(200, "text/plain", "WeMos DHT Server. Get /temp or /humidity");
  delay(100);
}

void read_sensor() {
  // Wait at least 2 seconds seconds between measurements.
  // If the difference between the current time and last time you read
  // the sensor is bigger than the interval you set, read the sensor.
  // Works better than delay for things happening elsewhere also.
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {
    // Save the last time you read the sensor
    previousMillis = currentMillis;

    // Reading temperature and humidity takes about 250 milliseconds!
    // Sensor readings may also be up to 2 seconds 'old' (it's a very slow sensor)
    humidity = dht.readHumidity();        // Read humidity as a percent
    temperature = dht.readTemperature();  // Read temperature as Celsius

    // Check if any reads failed and exit early (to try again).
    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }

    // Convert the floats to strings and round to 2 decimal places
    dtostrf(humidity, 1, 2, str_humidity);
    dtostrf(temperature, 1, 2, str_temperature);

    Serial.print("Humidity: ");
    Serial.print(str_humidity);
    Serial.print(" %\t");
    Serial.print("Temperature: ");
    Serial.print(str_temperature);
    Serial.println(" °C");
  }
}

void setup(void)
{
  // Open the Arduino IDE Serial Monitor to see what the code is doing
  Serial.begin(9600);
  dht.begin();

  Serial.println("WeMos DHT Server");
  Serial.println("");

  // Connect to your WiFi network
  WiFi.begin(ssid, password);
  Serial.print("Connecting");

  // Wait for successful connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to: ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.println("");

  // Initial read
  read_sensor();

  // Handle http requests
  server.on("/", handle_root);

  server.on("/temp", [](){
    read_sensor();
    char response[50];
    snprintf(response, 50, "Temperature: %s °C", str_temperature);
    server.send(200, "text/plain", response);
  });

  server.on("/humidity", [](){
    read_sensor();
    char response[50];
    snprintf(response, 50, "Humidity: %s %", str_humidity);
    server.send(200, "text/plain", response);
  });

  // Start the web server
  server.begin();
  Serial.println("HTTP server started");
}

void loop(void)
{
  // Listen for http requests
  server.handleClient();
}
```

このコードをD1 miniに流し込んだ後、起動するとあら不思議、温度・湿度を取得できるエンドポイントができます。D1 miniのipアドレスはfingか何かを使って調べておきましょう。以下のコマンドを試してみます。
```
$ curl <D1 miniのipアドレス>/temp
```
これで温度をGETすることができます！！同じように
```
$ curl  <D1 miniのipアドレス>/humidity
```
湿度も取得することができます。
次にSlack Botを作成します。私は[slackbot](https://github.com/lins05/slackbot)というpython製のslackようChat Botライブラリを使っています。
Botが動くコードのリポジトリを作っているのでよかったら参考にしてみてください。

[Gir Repo](https://google.co.jp)
#### 赤外線リモコン操作君

Slack で部屋の明かりをつけたり、消したりエアコンを操作してくれたりするすごいやつです。

### おまけ：テレビの予約とか喋ってくれる君
