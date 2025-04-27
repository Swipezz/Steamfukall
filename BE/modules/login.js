const chalk = require("chalk");
const puppeteer = require("puppeteer");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function steamLogin(user, pass) {
  console.log(chalk.blue(`⏳ Working on [${user}]`));
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.goto("https://store.steampowered.com/login/");

  try {
    await page.waitForSelector("._2GBWeup5cttgbTw8FM3tfx", { timeout: 10000 });
    const inputs = await page.$$("._2GBWeup5cttgbTw8FM3tfx");
    if (inputs.length > 0) {
      await inputs[0].type(user);
      console.log(chalk.green(`✅ Successfully input username for [${user}]`));
    } else {
      console.log(chalk.red(`❌ Failed to input username for [${user}]`));
      await browser.close();
      return { browser: null, page: null };
    }

    if (inputs.length > 1) {
      await inputs[1].type(pass);
      console.log(chalk.green(`✅ Successfully input password for [${user}]`));
    } else {
      console.log(chalk.red(`❌ Failed to input password for [${user}]`));
      await browser.close();
      return { browser: null, page: null };
    }

    await page.click(".DjSvCZoKKfoNSmarsEcTS");
    console.log(
      chalk.yellow(`🚪 Clicked Login for [${user}]. Waiting for PIN input...`)
    );

    return { browser, page };
  } catch (error) {
    console.error(
      chalk.red(`❌ Error during login process for [${user}]: ${error.message}`)
    );
  }
}

async function submitPin(page, pin) {
  try {
    await page.waitForSelector("._3xcXqLVteTNHmk-gh9W65d", { timeout: 60000 });
    const inputs2 = await page.$$("._3xcXqLVteTNHmk-gh9W65d");
    if (inputs2.length > 0) {
      await inputs2[0].type(pin);
      console.log(chalk.green(`✅ Successfully input PIN`));
    } else {
      console.log(chalk.red(`❌ PIN input field not found`));
      return;
    }

    await sleep(1000); // Tunggu sebentar setelah input PIN
    await page.click('button[type="submit"]'); // Asumsi ada tombol submit setelah input PIN
    console.log(chalk.yellow(`🔑 Submitting PIN...`));
    await page.waitForNavigation({ timeout: 60000 }); // Tunggu navigasi setelah submit
  } catch (err) {
    console.log(chalk.red(`❌ Error during PIN submission: ${err.message}`));
  } finally {
    // Tidak menutup browser di sini, karena dikelola di checker.js
  }
}

module.exports = { steamLogin, submitPin };
