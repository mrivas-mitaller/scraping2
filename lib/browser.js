const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

const launchBrowser = async () => {
  return await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });
};

module.exports = launchBrowser;


