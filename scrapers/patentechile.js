const puppeteer = require("puppeteer");

async function scrapePatenteChile(patente) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  let page;

  try {
    page = await browser.newPage();
    await page.goto("https://www.patentechile.com/", {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    // Escribir la patente
    await page.waitForSelector("#txtTerm", { timeout: 10000 });
    await page.type("#txtTerm", patente, { delay: 100 });

    // Click en buscar
    await page.click("#btnConsultar");

    // Esperar el resultado o un mensaje de error
    await page.waitForFunction(() => {
      const rows = document.querySelectorAll(".table tbody tr").length;
      const error = document.querySelector(".alert-danger");
      return rows > 0 || error;
    }, { timeout: 15000 });

    // Extraer datos si existen
    const data = await page.evaluate(() => {
      const getText = (label) => {
        const td = [...document.querySelectorAll("td")].find((el) =>
          el.textContent.includes(label)
        );
        return td?.nextElementSibling?.textContent.trim() || null;
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

    // Validación
    if (!data?.marca) {
      throw new Error("Datos no encontrados o formato inválido.");
    }

    return {
      ...data,
      patente: patente.toUpperCase(),
      estado: "Activo",
      fuente: "patentechile.com",
      fecha_registro: new Date().toISOString(),
    };
  } catch (err) {
    console.warn("❌ Error en scrapePatenteChile:", err.message);
    throw err;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = scrapePatenteChile;
