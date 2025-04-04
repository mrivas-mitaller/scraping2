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

  const patenteUpper = patente.toUpperCase();

  try {
    // Buscar si ya existe
    const { data: existing, error: searchError } = await supabase
      .from("vehiculos")
      .select("*")
      .eq("patente", patenteUpper)
      .maybeSingle();

    if (searchError) {
      console.error("❌ Supabase select error:", searchError.message);
      return res.status(500).json({ error: "Error al buscar en Supabase" });
    }

    if (existing) {
      console.log(`✅ Patente ${patenteUpper} ya existe en Supabase`);
      return res.json(existing);
    }

    // No existe, proceder con scraping
    const browser = await launchBrowser();

    let data = await scrapePatenteChile(browser, patenteUpper);
    if (!data?.marca) data = await scrapeVolanteOMaleta(browser, patenteUpper);
    if (!data?.marca) data = await scrapeAutoData(browser, patenteUpper);

    if (!data?.marca) {
      return res.status(404).json({ error: "No se encontraron datos" });
    }

    // Insertar en Supabase
    const { error: insertError } = await supabase.from("vehiculos").insert([data]);

    if (insertError) {
      console.error("❌ Supabase insert error:", insertError.message);
      return res.status(500).json({ error: "Error al guardar en Supabase" });
    }

    return res.json(data);
  } catch (err) {
    console.error("❌ Error general:", err.message);
    res.status(500).json({ error: "Error general", message: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🟢 Servidor activo en http://localhost:${PORT}`);
});
