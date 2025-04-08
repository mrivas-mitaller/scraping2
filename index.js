const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const fetchVehicleData = require("./scrapers/boostr");

// Cargar variables de entorno si no está en producción
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// Validación de variables críticas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL_V2 || !process.env.SUPABASE_SERVICE_ROLE_KEY_V2 || !process.env.BOOSTR_API_KEY) {
  console.error("❌ Faltan variables de entorno necesarias");
  process.exit(1);
}

// Inicializar Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_V2,
  process.env.SUPABASE_SERVICE_ROLE_KEY_V2
);

// Configuración del servidor
const app = express();
app.use(cors());
app.use(express.json());

// Ruta básica de prueba
app.get("/", (req, res) => {
  res.send("🚀 Microservicio Boostr activo.");
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
      console.log(`ℹ️ Patente ${patenteUpper} ya registrada`);
      return res.json(existing);
    }

    // Consultar API de Boostr
    const data = await fetchVehicleData(patenteUpper);

    if (!data) {
      return res.status(404).json({ error: "No se encontraron datos para esta patente" });
    }

    // Insertar en Supabase
    const { error: insertError } = await supabase
      .from("vehiculos")
      .insert([data]);

    if (insertError) {
      console.error("❌ Error al insertar en Supabase:", insertError.message);
      return res.status(500).json({ error: "Error al guardar en Supabase" });
    }

    return res.json(data);
  } catch (err) {
    console.error("❌ Error general:", err.message);
    return res.status(500).json({ error: "Error interno", message: err.message });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🟢 API activa en http://localhost:${PORT}`);
});
