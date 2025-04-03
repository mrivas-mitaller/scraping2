module.exports = async function scrapeVolanteOMaleta(browser, patente) {
  try {
    const page = await browser.newPage();
    const url = `https://www.volanteomaleta.com/?patente=${patente.toUpperCase()}`;
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
        fuente: "volanteomaleta.com",
      };
    });

    await page.close();
    return data;
  } catch (error) {
    console.warn("⚠️ Error en volanteomaleta:", error.message);
    return null;
  }
};
