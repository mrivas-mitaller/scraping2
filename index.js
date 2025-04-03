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

// Ruta principal
app.post("/scrape", async (req, res) => {
  const { patente } = req.body;
  console.log("📥 Solicitud recibida en /scrape:", req.body);

  if (!patente) {
    return res.status(400).json({ error: "Patente requerida" });
  }

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    const url = `https://www.patentechile.com/patente-${patente.toUpperCase()}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

    // Esperar la tabla donde aparecen los datos del vehículo
    await page.waitForSelector("table", { timeout: 10000 });

    const data = await page.evaluate(() => {
      const getText = (label) => {
        const el = [...document.querySelectorAll("td")].find((td) =>
          td.textContent.includes(label)
        );
        return el ? el.nextElementSibling?.textContent?.trim() : "";
      };

      return {
        rut_propietario: getText("RUT:"),
        nombre_propietario: getText("Nombre:"),
        patente: getText("Patente:"),
        marca: getText("Marca:"),
        modelo: getText("Modelo:"),
        tipo: getText("Tipo Vehículo:"),
        anio: parseInt(getText("Año:")) || null,
        color: getText("Color:"),
        numero_motor: getText("Nº Motor:"),
        numero_chasis: getText("Nº Chasis:"),
        revision_tecnica: {
          estado: getText("Estado"),
          vencimiento: getText("Fecha de vencimiento"),
        },
        permiso_circulacion: {
          estado: getText("Estado"),
          vencimiento: getText("Fecha de vencimiento"),
        },
        seguro: {
          compania: getText("Compañía"),
          poliza: getText("Poliza"),
          vencimiento: getText("Fecha de vencimiento"),
        },
      };
    });

    await browser.close();

    // Validación básica
    if (!data.marca || !data.modelo) {
      return res.status(404).json({
        error: "No se encontraron datos para la patente",
      });
    }

    // Devolver los datos con formato unificado
    return res.json({
      ...data,
      patente: patente.toUpperCase(),
      estado: "Activo",
      kilometraje: 0,
      fecha_registro: new Date()._


const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🧪 Scraper activo en http://localhost:${PORT}`)
);
