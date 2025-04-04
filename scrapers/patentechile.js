const puppeteer = require("puppeteer");

async function scrapePatenteChile(browser, patente) {
  let page;

  try {
    page = await browser.newPage();
    await page.goto("https://www.patentechile.com/", {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    await page.waitForSelector("#txtTerm", { timeout: 10000 });
    await page.type("#txtTerm", patente.toUpperCase(), { delay: 100 });
    await page.click("#btnConsultar");

    await page.waitForFunction(() => {
      const rows = document.querySelectorAll(".table tbody tr").length;
      const error = document.querySelector(".alert-danger");
      return rows > 0 || error;
    }, { timeout: 15000 });

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
        numero_motor: getText("Nº Motor:"),
        vin: getText("Nº Chasis:"),
      };
    });

    if (!data?.marca) throw new Error("Datos no encontrados o formato inválido");

    return {
      patente: patente.toUpperCase(),
      marca: data.marca,
      modelo: data.modelo,
      anio: data.anio,
      version: null,
      tipo: data.tipo,
      color: data.color,
      numero_motor: data.numero_motor,
      vin: data.vin,
      transmision: null,
      tipo_combustible: null,
      puertas: null,
      fabricante: data.marca,
      procedencia: null,
      kilometraje: 0,
      estado: "Activo",
      rut_propietario: null,
      nombre_propietario: null,
      revision_tecnica: null,
      permiso_circulacion: null,
      seguro: null,
      fecha_registro: new Date().toISOString(),
      fuente: "patentechile.com",
    };
  } catch (err) {
    console.warn("❌ Error en scrapePatenteChile:", err.message);
    return null;
  } finally {
    if (page) await page.close();
  }
}

module.exports = scrapePatenteChile;
