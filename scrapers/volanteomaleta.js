module.exports = async function scrapeVolanteOMaleta(browser, patente) {
  let page;

  try {
    page = await browser.newPage();

    await page.goto("https://www.volanteomaleta.com/", {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    // Usar selector específico del formulario de patente
    const inputSelector = "form[action='patente'] input[name='term']";
    await page.waitForSelector(inputSelector, { timeout: 10000 });
    await page.type(inputSelector, patente.toUpperCase(), { delay: 75 });

    // Click en el botón submit en lugar de Enter
    await page.click("form[action='patente'] button[type='submit']");

    // Esperar navegación a la ruta /patente
    await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 10000 });

    // Esperar la tabla con los resultados
    await page.waitForSelector("table", { timeout: 10000 });

    const data = await page.evaluate(() => {
      const getText = (label) => {
        const td = [...document.querySelectorAll("td")].find((el) =>
          el.textContent.includes(label)
        );
        return td?.nextElementSibling?.textContent?.trim() || null;
      };

      return {
        marca: getText("Marca"),
        modelo: getText("Modelo"),
        tipo: getText("Tipo de vehículo"),
        anio: parseInt(getText("Año")) || null,
        color: getText("Color"),
        numero_motor: getText("Motor"),
        numero_chasis: getText("Chasis"),
        fuente: "volanteomaleta.com"
      };
    });

    if (!data?.marca) throw new Error("No se encontraron datos válidos.");

    return {
      ...data,
      patente: patente.toUpperCase(),
      estado: "Activo",
      fecha_registro: new Date().toISOString()
    };
  } catch (error) {
    console.warn("⚠️ Error en scrapeVolanteOMaleta:", error.message);
    return null;
  } finally {
    if (page) await page.close();
  }
};
