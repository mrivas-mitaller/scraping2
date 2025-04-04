const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const launchBrowser = require("./lib/browser");

const scrapePatenteChile = require("./scrapers/patentechile");
const scrapeVolanteOMaleta = require("./scrapers/volanteomaleta");
const scrapeAutoData = require("./scrapers/autodata");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_V2,
  process.env.SUPABASE_SERVICE_ROLE_KEY_V2
);

app.get("/", (req, res) => {
  res.send("🚗 Scraper de patentes activo y conectado a Supabase");
});

app.post("/scrape", async (req, res) => {
  const { patente } = req.body;
  if (!patente) return res.status(400).json({ error: "Patente requerida" });

  const browser = await launchBrowser();

  try {
    let data = await scrapePatenteChile(browser, patente);
    if (!data?.marca) data = await scrapeVolanteOMaleta(browser, patente);
    if (!data?.marca) data = await scrapeAutoData(browser, patente);

    if (!data?.marca) {
      return res.status(404).json({ error: "No se encontraron datos" });
    }

    // Insertar en Supabase
    const { error } = await supabase.from("vehiculos").insert([data]);
    if (error) {
      console.error("❌ Supabase error:", error.message);
      return res.status(500).json({ error: "Error al guardar en Supabase" });
    }

    return res.json(data);
  } catch (err) {
    console.error("❌ Error general:", err.message);
    res.status(500).json({ error: "Error general", message: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🟢 Servidor activo en http://localhost:${PORT}`);
});
