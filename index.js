const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const launchBrowser = require("./lib/browser");
const scrapeBoostr = require("./scrapers/boostr");

// Cargar .env si no está en producción
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Validar variables críticas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL_V2 || !process.env.SUPABASE_SERVICE_ROLE_KEY_V2) {
  console.error("❌ Faltan variables de entorno necesarias para Supabase");
  process.exit(1);
}

if (!process.env.BOOSTR_API_KEY) {
  console.error("❌ Falta la variable BOOSTR_API_KEY");
  process.exit(1);
}

// Inicializar cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_V2,
  process.env.SUPABASE_SERVICE_ROLE_KEY_V2
);

// Inicializar Express
const app = express();
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("🚗 API de patentes activa y conectada a Supabase + Boostr");
});

// Endpoint /scrape
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

    // Scraping desde Boostr
    const scrapedData = await scrapeBoostr(patenteUpper);

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

// Iniciar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🟢 API activa en http://localhost:${PORT}`);
});
