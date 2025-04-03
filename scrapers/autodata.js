module.exports = async function scrapeAutoData(browser, patente) {
  try {
    const page = await browser.newPage();
    const url = "https://autodata.cl/";
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

    // Esperar input y escribir patente
    await page.waitForSelector("input[name='patente']", { timeout: 10000 });
    await page.type("input[name='patente']", patente.toUpperCase());

    // Clickear botón "Buscar"
    await page.click("button[type='submit']");

    // Esperar render de datos (puede tardar unos segundos)
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
        return "";
      };

      return {
        marca: getText("Marca"),
        modelo: getText("Modelo"),
        tipo: getText("Tipo de vehículo"),
        anio: parseInt(getText("Año")) || null,
        color: getText("Color"),
        numero_motor: getText("Motor"),
        numero_chasis: getText("Chasis"),
        fuente: "autodata.cl"
      };
    });

    await page.close();
    return data;
  } catch (error) {
    console.warn("⚠️ Error en scrapeAutoData:", error.message);
    return null;
  }
};
