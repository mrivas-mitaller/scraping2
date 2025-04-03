module.exports = async function scrapeVolanteOMaleta(browser, patente) {
  try {
    const page = await browser.newPage();
    const url = "https://www.volanteomaleta.com/";
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

    // Esperar input
    await page.waitForSelector("input[name='patente']", { timeout: 10000 });

    // Escribir patente
    await page.type("input[name='patente']", patente.toUpperCase());

    // Presionar Enter para enviar el formulario
    await page.keyboard.press("Enter");

    // Esperar navegación a /patente
    await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 10000 });

    // Esperar tabla o contenedor donde aparezcan los datos
    await page.waitForSelector("table", { timeout: 10000 });

    // Scraping de los datos
    const data = await page.evaluate(() => {
      const getText = (label) => {
        const el = [...document.querySelectorAll("td")].find((td) =>
          td.textContent.includes(label)
        );
        return el ? el.nextElementSibling?.textContent?.trim() : "";
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

    await page.close();
    return data;
  } catch (error) {
    console.warn("⚠️ Error en scrapeVolanteOMaleta:", error.message);
    return null;
  }
};
