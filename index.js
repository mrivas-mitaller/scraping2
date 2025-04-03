const express = require("express")
const puppeteer = require("puppeteer")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

app.post("/scrape", async (req, res) => {
  const { patente } = req.body

  if (!patente) {
    return res.status(400).json({ error: "Patente requerida" })
  }

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  try {
    const page = await browser.newPage()
    const url = `https://www.patentechile.com/patente-${patente.toUpperCase()}`
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 })

    const data = await page.evaluate(() => {
      const getText = (label) => {
        const el = [...document.querySelectorAll("td")].find((td) => td.textContent.includes(label))
        return el ? el.nextElementSibling?.textContent?.trim() : ""
      }

      return {
        marca: getText("Marca:"),
        modelo: getText("Modelo:"),
        tipo: getText("Tipo Vehículo:"),
        anio: parseInt(getText("Año:")) || null,
        color: getText("Color:"),
        motor: getText("Nº Motor:"),
        chasis: getText("Nº Chasis:"),
      }
    })

    await browser.close()

    if (!data.marca) {
      return res.status(404).json({ error: "No se encontraron datos para la patente" })
    }

    return res.json({
      ...data,
      patente: patente.toUpperCase(),
      estado: "Activo",
      fecha_registro: new Date().toISOString(),
    })
  } catch (error) {
    await browser.close()
    console.error("Scraping error:", error)
    res.status(500).json({ error: "Error al obtener datos de la patente" })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`🧪 Scraper activo en http://localhost:${PORT}`))
