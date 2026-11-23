// CrowPanel ESP32-S3 4.2" e-paper (400x300, SSD1683): show willmarsh.dev/eink/today.
//
// Wakes every REFRESH_MINUTES, downloads the 15,000-byte raw frame from the site,
// draws it, then deep-sleeps. Libraries: GxEPD2 (and its Adafruit GFX dependency).
// Board: ESP32S3 Dev Module, PSRAM enabled. Copy secrets.example.h to secrets.h first.
//
// Not yet compiled or run on hardware. Driver and pins follow the published
// CrowPanel + GxEPD2 guides (GYE042A87 class, panel power on GPIO 7); if the
// image is faint or blank, try GxEPD2_420_GDEY042T81 instead.

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <GxEPD2_BW.h>
#include "secrets.h" // WIFI_SSID, WIFI_PASSWORD

#define PIN_PWR 7
#define PIN_BUSY 48
#define PIN_RST 47
#define PIN_DC 46
#define PIN_CS 45
// SCK 12 / MOSI 11 are the ESP32-S3's default SPI pins, so no SPI.begin() needed.

// ?invert=1 makes 1 bits black, which is what Adafruit GFX's drawBitmap expects.
static const char *FRAME_URL = "https://willmarsh.dev/eink/today.bin?invert=1";
static const uint32_t REFRESH_MINUTES = 15;
static const size_t FRAME_BYTES = 400 * 300 / 8;

GxEPD2_BW<GxEPD2_420_GYE042A87, GxEPD2_420_GYE042A87::HEIGHT> epd(
    GxEPD2_420_GYE042A87(PIN_CS, PIN_DC, PIN_RST, PIN_BUSY));

static uint8_t frame[FRAME_BYTES];

static bool connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  for (int i = 0; i < 40 && WiFi.status() != WL_CONNECTED; i++) delay(250);
  return WiFi.status() == WL_CONNECTED;
}

static bool downloadFrame() {
  WiFiClientSecure client;
  client.setInsecure(); // Fine for a public weather image; pin a CA cert if you prefer.
  HTTPClient http;
  http.useHTTP10(true); // no chunked encoding, so the body is exactly the frame
  if (!http.begin(client, FRAME_URL)) return false;
  bool ok = false;
  if (http.GET() == HTTP_CODE_OK && http.getSize() == (int)FRAME_BYTES) {
    WiFiClient *stream = http.getStreamPtr();
    size_t got = 0;
    uint32_t deadline = millis() + 10000;
    while (got < FRAME_BYTES && millis() < deadline) {
      int n = stream->read(frame + got, FRAME_BYTES - got);
      if (n > 0) got += n; else delay(5);
    }
    ok = got == FRAME_BYTES;
  }
  http.end();
  return ok;
}

static void draw() {
  epd.setRotation(0); // landscape, 400 wide
  epd.setFullWindow();
  epd.firstPage();
  do {
    epd.fillScreen(GxEPD_WHITE);
    epd.drawBitmap(0, 0, frame, 400, 300, GxEPD_BLACK);
  } while (epd.nextPage());
}

void setup() {
  pinMode(PIN_PWR, OUTPUT);
  digitalWrite(PIN_PWR, HIGH); // panel power; the image stays after it's cut
  epd.init(115200, true, 50, false);

  // On failure, leave the last good image on screen and try again next wake.
  if (connectWifi() && downloadFrame()) draw();

  epd.hibernate();
  digitalWrite(PIN_PWR, LOW);
  WiFi.disconnect(true);
  esp_sleep_enable_timer_wakeup((uint64_t)REFRESH_MINUTES * 60 * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {}
