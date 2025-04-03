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

    // 1. Ir al sitio principal
    await page.goto("https://www.patentechile.com", {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    // 2. Esperar e ingresar la patente en el input
    await page.waitForSelector("input[name='patente']", { timeout: 10000 });
    await page.type("input[name='patente']", patente.toUpperCase());

    // 3. Hacer clic en el botón de búsqueda
    await page.click("button[type='submit']");

    // 4. Esperar que aparezca la tabla
    await page.waitForSelector(".table tbody tr", { timeout: 15000 });

    // 5. Extraer los datos
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🧪 Scraper activo en http://localhost:${PORT}`)
);
