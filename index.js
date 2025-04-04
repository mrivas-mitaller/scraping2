const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const launchBrowser = require("./lib/browser");

const scrapePatenteChile = require("./scrapers/patentechile");
const scrapeVolanteOMaleta = require("./scrapers/volanteomaleta");
const scrapeAutoData = require("./scrapers/autodata");

// Cargar .env si está en entorno local
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Validación de variables críticas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL_V2 || !process.env.SUPABASE_SERVICE_ROLE_KEY_V2) {
  console.error("❌ Faltan variables de entorno necesarias para Supabase");
  process.exit(1);
}

// Inicializar cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_V2,
  process.env.SUPABASE_SERVICE_ROLE_KEY_V2
);

// Configuración de Express
const app = express();
app.use(cors());
app.use(express.json());

// Ruta raíz de prueba
app.get("/", (req, res) => {
  res.send("🚗 Scraper de patentes activo y conectado a Supabase");
});

// Endpoint principal
app.post("/scrape", async (req, res) => {
  const { patente } = req.body;
  if (!patente) return res.status(400).json({ error: "Patente requerida" });

  const patenteUpper = patente.toUpperCase();

  try {
    // Verificar si ya existe en Supabase
    const { data: existing, error: selectError } = await supabase
      .from("vehiculos")
      .select("*")
      .eq("patente", patenteUpper)
      .maybeSingle();

    if (selectError) {
      console.error("❌ Error al consultar Supabase:", selectError.message);
      return res.status(500).json({ error: "Error al buscar en Supabase" });
    }

    if (existing) {
      console.log(`✅ Patente ${patenteUpper} ya registrada`);
      return res.json(existing);
    }

    // Scraping desde múltiples fuentes
    const browser = await launchBrowser();

    const scrapers = [scrapePatenteChile, scrapeVolanteOMaleta, scrapeAutoData];
    let scrapedData = null;

    for (const scraper of scrapers) {
      scrapedData = await scraper(browser, patenteUpper);
      if (scrapedData?.marca) break;
    }

    await browser.close();

    if (!scrapedData || !scrapedData.marca) {
      return res.status(404).json({ error: "No se encontraron datos para esta patente" });
    }

    // Insertar en Supabase
    const { error: insertError } = await supabase
      .from("vehiculos")
      .insert([scrapedData]);

    if (insertError) {
      console.error("❌ Error al insertar en Supabase:", insertError.message);
      return res.status(500).json({ error: "Error al guardar en Supabase" });
    }

    return res.json(scrapedData);
  } catch (err) {
    console.error("❌ Error general:", err.message);
    return res.status(500).json({ error: "Error en el servidor", message: err.message });
  }
});

// Arrancar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🟢 API activa en http://localhost:${PORT}`);
});
