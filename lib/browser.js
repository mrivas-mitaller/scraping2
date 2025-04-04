const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

module.exports = async function getBrowser() {
  return await puppeteer.launch({
    headless: chromium.headless,
    executablePath: await chromium.executablePath(),
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    ignoreHTTPSErrors: true,
  });
};
