const puppeteer = require("puppeteer");

module.exports = async function launchBrowser() {
  return puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
};

