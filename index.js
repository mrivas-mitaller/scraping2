const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Ruta base para confirmar que la API está viva
app.get("/", (req, res) => {
  res.send("✅ API funcionando desde Railway");
});

// Ruta principal de scraping
app.post("/scrape", async (req, res) => {
  console.log("📥 Solicitud recibida en /scrape:", req.body);

  const { patente } = req.body;

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
    const url = `https://www.patentechile.com/patente-${patente.toUpperCase()}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

    const data = await page.evaluate(() => {
      const getText = (label) => {
        const el = [...document.querySelectorAll("td")].find((td) =>
          td.textContent.includes(label)
        );
        return el ? el.nextElementSibling?.textContent?.trim() : "";
      };

      return {
        marca: getText("Marca:"),
        modelo: getText("Modelo:"),
        tipo: getText("Tipo Vehículo:"),
        anio: parseInt(getText("Año:")) || null,
        color: getText("Color:"),
        motor: getText("Nº Motor:"),
        chasis: getText("Nº Chasis:"),
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
    res.status(500).json({ error: "Error al obtener datos de la patente" });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// Puerto dinámico para Railway (usa 8080 por defecto)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🧪 Scraper activo en http://localhost:${PORT}`)
);
