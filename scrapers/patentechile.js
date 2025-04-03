module.exports = async function scrapePatenteChile(browser, patente) {
  try {
    const page = await browser.newPage();
    const url = "https://www.patentechile.com/";
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

    // Esperar que cargue el formulario
    await page.waitForSelector("input[name='patente']", { timeout: 10000 });

    // Completar la patente en el input
    await page.type("input[name='patente']", patente.toUpperCase());

    // Hacer submit
    await Promise.all([
      page.click("button[type='submit']"),
      page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 10000 }),
    ]);

    // Esperar que cargue la tabla con los datos
    await page.waitForSelector("table", { timeout: 10000 });

    const data = await page.evaluate(() => {
      const getText = (label) => {
        const el = [...document.querySelectorAll("td")].find((td) =>
          td.textContent.includes(label)
        );
        return el ? el.nextElementSibling?.textContent?.trim() : "";
      };

      return {
        marca: getText("Marca:"),
        modelo: getText("Modelo:"),
        tipo: getText("Tipo Vehículo:"),
        anio: parseInt(getText("Año:")) || null,
        color: getText("Color:"),
        numero_motor: getText("Nº Motor:"),
        numero_chasis: getText("Nº Chasis:"),
        rut_propietario: getText("RUT:"),
        nombre_propietario: getText("Nombre:"),
        fuente: "patentechile.com",
      };
    });

    await
