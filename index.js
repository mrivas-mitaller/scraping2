const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const fetchVehicleData = require("./scrapers/boostr");

// 🌱 Cargar variables de entorno en desarrollo
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// 🧪 Validación de variables críticas
const REQUIRED_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL_V2",
  "SUPABASE_SERVICE_ROLE_KEY_V2",
  "BOOSTR_API_KEY"
];

const missingVars = REQUIRED_VARS.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
  console.error("❌ Faltan variables de entorno necesarias:", missingVars.join(", "));
  process.exit(1);
}

// 🛠️ Inicializar Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_V2,
  process.env.SUPABASE_SERVICE_ROLE_KEY_V2
);

// 🚀 Crear servidor Express
const app = express();
app.use(cors());
app.use(express.json());

// 🌐 Ruta de verificación
app.get("/", (req, res) => {
  res.send("✅ API de consulta de patentes activa y operativa.");
});

// 🔍 Endpoint principal
app.post("/scrape", async (req, res) => {
  try {
    const { patente } = req.body;

    if (!patente || typeof patente !== "string") {
      return res.status(400).json({ error: "Debe proporcionar una patente válida" });
    }

    const patenteUpper = patente.toUpperCase();

    // Verificar si ya existe en Supabase
    const { data: existing, error: fetchError } = await supabase
      .from("vehicles")
      .select("*")
      .eq("plate", patenteUpper)
      .maybeSingle();

    if (fetchError) {
      console.error("❌ Error al consultar Supabase:", fetchError.message);
      return res.status(500).json({ error: "Error al consultar base de datos" });
    }

    if (existing) {
      console.log(`ℹ️ Vehículo con patente ${patenteUpper} ya registrado.`);
      return res.status(200).json(existing);
    }

    // Llamar API externa (Boostr)
    const data = await fetchVehicleData(patenteUpper);

    if (!data || !data.plate) {
      return res.status(404).json({ error: "No se encontraron datos para la patente proporcionada" });
    }

    // Guardar en Supabase
    const { error: insertError } = await supabase
      .from("vehicles")
      .insert([data]);

    if (insertError) {
      console.error("❌ Error al insertar en Supabase:", insertError.message);
      return res.status(500).json({ error: "No se pudo guardar el vehículo" });
    }

    return res.status(201).json(data);
  } catch (error) {
    console.error("❌ Error general:", error.message);
    return res.status(500).json({ error: "Error interno del servidor", message: error.message });
  }
});

// 🟢 Iniciar el servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🟢 API activa y escuchando en http://localhost:${PORT}`);
});
