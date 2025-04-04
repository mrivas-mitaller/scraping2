const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

module.exports = async function launchBrowser() {
  return await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
};


