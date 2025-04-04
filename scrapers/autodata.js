module.exports = async function scrapeAutoData(browser, patente) {
  let page;

  try {
    page = await browser.newPage();
    await page.goto("https://autodata.cl/", {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    await page.waitForSelector("input[name='patente']", { timeout: 10000 });
    await page.type("input[name='patente']", patente.toUpperCase());
    await page.click("button[type='submit']");

    await page.waitForSelector(".table", { timeout: 10000 });

    const data = await page.evaluate(() => {
      const getText = (label) => {
        const rows = document.querySelectorAll(".table tr");
        for (const row of rows) {
          const cells = row.querySelectorAll("td");
          if (cells.length >= 2 && cells[0].textContent.includes(label)) {
            return cells[1].textContent.trim();
          }
        }
        return null;
      };

      return {
        marca: getText("Marca"),
        modelo: getText("Modelo"),
        tipo: getText("Tipo de vehículo"),
        anio: parseInt(getText("Año")) || null,
        color: getText("Color"),
        numero_motor: getText("Motor"),
        vin: getText("Chasis"),
        nombre_propietario: getText("Propietario"),
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
      nombre_propietario: data.nombre_propietario || null,
      revision_tecnica: null,
      permiso_circulacion: null,
      seguro: null,
      fecha_registro: new Date().toISOString(),
      fuente: "autodata.cl",
    };
  } catch (error) {
    console.warn("⚠️ Error en scrapeAutoData:", error.message);
    return null;
  } finally {
    if (page) await page.close();
  }
};
