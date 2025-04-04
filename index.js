const express = require("express");
const cors = require("cors");

const getBrowser = require("./lib/browser");

const scrapePatenteChile = require("./scrapers/patentechile");
const scrapeVolanteOMaleta = require("./scrapers/volanteomaleta");
const scrapeAutodata = require("./scrapers/autodata");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Scraper multi-fuente funcionando");
});

app.post("/scrape", async (req, res) => {
  const { patente } = req.body;

  if (!patente) {
    return res.status(400).json({ error: "Patente requerida" });
  }

  const browser = await getBrowser();

  try {
    let data = await scrapePatenteChile(browser, patente);
    if (!data || !data.marca) {
      console.log("➡️ Fallback a volanteomaleta");
      data = await scrapeVolanteOMaleta(browser, patente);
    }

    if (!data || !data.marca) {
      console.log("➡️ Fallback a autodata");
      data = await scrapeAutodata(browser, patente);
    }

    if (!data || !data.marca) {
      return res.status(404).json({ error: "No se encontraron datos en ninguna fuente" });
    }

    return res.json({
      ...data,
      patente: patente.toUpperCase(),
      estado: "Activo",
      kilometraje: 0,
      fecha_registro: new Date().toISOString(),
      fuente: data.fuente,
    });
  } catch (err) {
    console.error("❌ Error en scraping:", err);
    res.status(500).json({ error: "Error en scraping", details: err.message });
  } finally {
    await browser.close();
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🧪 Scraper multi-fuente activo en http://localhost:${PORT}`);
});
