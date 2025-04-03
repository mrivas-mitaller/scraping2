module.exports = async function scrapeAutodata(browser, patente) {
  try {
    const page = await browser.newPage();
    const url = `https://autodata.cl/vehiculo/${patente.toUpperCase()}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 });
    // TODO: ajustar selectores reales

    const data = await page.evaluate(() => {
      return {
        marca: "", // ← ajustar según estructura real
        modelo: "",
        tipo: "",
        anio: null,
        color: "",
        numero_motor: "",
        numero_chasis: "",
        fuente: "autodata.cl",
      };
    });

    await page.close();
    return data;
  } catch (error) {
    console.warn("⚠️ Error en autodata:", error.message);
    return null;
  }
};
