const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Ruta de salud
app.get("/", (req, res) => {
  res.send("✅ API funcionando desde Railway");
});

// Ruta principal de scraping
app.post("/scrape", async (req, res) => {
  const { patente } = req.body;
  console.log("📥 Solicitud recibida en /scrape:", req.body);

  if (!patente) {
    return res.status(400).json({ error: "Patente requerida" });
  }

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
    );

    const url = `https://www.patentechile.com/patente-${patente.toUpperCase()}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

    // Esperar la tabla si existe
    await page.waitForSelector(".table tbody tr", { timeout: 10000 });

    const data = await page.evaluate(() => {
      const rows = [...document.querySelectorAll(".table tbody tr")];

      const getValue = (label) => {
        const row = rows.find((tr) =>
          tr.children[0]?.textContent.trim().toLowerCase().includes(label.toLowerCase())
        );
        return row ? row.children[1]?.textContent.trim() : "";
      };

      return {
        marca: getValue("marca"),
        modelo: getValue("modelo"),
        tipo: getValue("tipo"),
        anio: parseInt(getValue("año")) || null,
        color: getValue("color"),
        motor: getValue("motor"),
        chasis: getValue("chasis"),
      };
    });

    if (!data.marca) {
      return res.status(404).json({ error: "No se encontraron datos para la patente" });
    }

    res.json({
      ...data,
      patente: patente.toUpperCase(),
      estado: "Activo",
      fecha_registro: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error en el scraping:", error);
    res.status(500).json({ error: "Error al obtener datos de la patente", details: error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// Ruta de depuración para inspección visual y HTML
app.post("/debug", async (req, res) => {
  const { patente } = req.body;
  console.log("🛠️ Debug solicitado para:", patente);

  if (!patente) {
    return res.status(400).json({ error: "Patente requerida para debug" });
  }

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
    );

    const url = `https://www.patentechile.com/patente-${patente.toUpperCase()}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

    // Intentar esperar la tabla (no obligatorio)
    try {
      await page.waitForSelector(".table tbody tr", { timeout: 10000 });
    } catch {
      console.warn("⚠️ La tabla no apareció en tiempo esperado");
    }

    // Captura de pantalla
    await page.screenshot({ path: "debug.png", fullPage: true });

    // HTML completo
    const html = await page.content();

    // Dump de filas de la tabla
    const tableDump = await page.evaluate(() => {
      return [...document.querySelectorAll(".table tbody tr")].map((tr) => ({
        label: tr.children[0]?.textContent.trim(),
        value: tr.children[1]?.textContent.trim(),
      }));
    });

    await browser.close();

    res.json({
      url,
      message: "🧪 Captura y dump completados.",
      tableDump,
      htmlSnippet: html.substring(0, 2000) + "..."
    });
  } catch (error) {
    console.error("❌ Error en /debug:", error);
    if (browser) await browser.close();
    res.status(500).json({ error: "Error durante el debug", details: error.message });
  }
});

// Railway define PORT automáticamente
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🧪 Scraper activo en http://localhost:${PORT}`)
);

