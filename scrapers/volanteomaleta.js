module.exports = async function scrapeVolanteOMaleta(browser, patente) {
  let page;

  try {
    page = await browser.newPage();
    await page.goto("https://www.volanteomaleta.com/", {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    await page.waitForSelector("input[name='patente']", { timeout: 10000 });
    await page.type("input[name='patente']", patente.toUpperCase());
    await page.keyboard.press("Enter");

    await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForSelector("table", { timeout: 10000 });

    const data = await page.evaluate(() => {
      const getText = (label) => {
        const el = [...document.querySelectorAll("td")].find((td) =>
          td.textContent.includes(label)
        );
        return el?.nextElementSibling?.textContent?.trim() || null;
      };

      return {
        marca: getText("Marca"),
        modelo: getText("Modelo"),
        tipo: getText("Tipo de vehículo"),
        anio: parseInt(getText("Año")) || null,
        color: getText("Color"),
        numero_motor: getText("Motor"),
        vin: getText("Chasis"),
      };
    });

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
      fuente: "volanteomaleta.com",
    };
  } catch (error) {
    console.warn("⚠️ Error en scrapeVolanteOMaleta:", error.message);
    return null;
  } finally {
    if (page) await page.close();
  }
};
