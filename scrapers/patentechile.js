const puppeteer = require("puppeteer");

async function scrapePatenteChile(patente) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.goto("https://www.patentechile.com/", {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    // Esperar el input y escribir la patente
    await page.waitForSelector("#txtTerm", { timeout: 10000 });
    await page.type("#txtTerm", patente);

    // Hacer click en el botón
    await page.click("#btnConsultar");

    // Esperar resultados
    await page.waitForSelector(".table tbody tr", { timeout: 10000 });

    // Evaluar datos desde la tabla
    const data = await page.evaluate(() => {
      const getText = (label) => {
        const td = [...document.querySelectorAll("td")].find((el) =>
          el.textContent.includes(label)
        );
        return td?.nextElementSibling?.textContent.trim() || "";
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

    await browser.close();

    if (!data.marca) throw new Error("No se encontraron datos");

    return {
      ...data,
      patente: patente.toUpperCase(),
      estado: "Activo",
      fecha_registro: new Date().toISOString(),
    };
  } catch (error) {
    await browser.close();
    console.warn("⚠️ Error en scrapePatenteChile:", error.message);
    throw error;
  }
}

module.exports = scrapePatenteChile;
