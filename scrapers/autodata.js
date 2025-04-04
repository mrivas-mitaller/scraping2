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
const puppeteer = require('puppeteer-core'); // o 'puppeteer' si no estás usando core
const chromium = require('@sparticuz/chromium'); // solo si estás en Railway o Lambda
const path = require('path');

const scrapePatenteChile = async (patente = 'AA1234') => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false, // cambia a true en producción si no hay captcha
      executablePath: process.env.CHROME_PATH || chromium.executablePath,
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();
    await page.goto('https://autodata.cl', { waitUntil: 'domcontentloaded' });

    // Esperar a que cargue el campo de patente
    await page.waitForSelector('input.form-control', { timeout: 10000 });

    // Escribir la patente
    await page.type('input.form-control', patente, { delay: 100 });

    // Hacer clic en el botón de búsqueda
    await page.click('button.btn-primary');

    // Esperar a que aparezca el resultado (uno de los headers comunes)
    await page.waitForSelector('.result-container h5', { timeout: 15000 });

    // Extraer contenido visible
    const result = await page.evaluate(() => {
      const owner = document.querySelector('.info-block h6:contains("Propietario") + p');
      const plate = document.querySelector('.info-block strong')?.innerText;
      const model = [...document.querySelectorAll('.info-block p')]
        .find(p => p.textContent.includes('Modelo'))?.innerText;

      return {
        propietario: owner?.innerText || 'No disponible',
        patente: plate || 'Desconocida',
        modelo: model || 'Sin información',
      };
    });

    return result;

  } catch (error) {
    console.error('❌ Error en scraper Autodata:', error.message);
    return { error: true, message: error.message };
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = scrapePatenteChile;
