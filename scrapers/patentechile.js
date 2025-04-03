module.exports = async function scrapePatenteChile(browser, patente) {
  try {
    const page = await browser.newPage();
    const url = `https://www.patentechile.com/patente-${patente.toUpperCase()}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 });
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
        fuente: "patentechile.com",
      };
    });

    await page.close();
    return data;
  } catch (error) {
    console.warn("⚠️ Error en patentechile:", error.message);
    return null;
  }
};
