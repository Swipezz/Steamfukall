const chalk = require("chalk");
const puppeteer = require("puppeteer");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function steamLogin(user, pass) {
    console.log(chalk.blue(`⏳ Working on [${user}]`));
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });

    const page = await browser.newPage();
    await page.goto("https://store.steampowered.com/login/");

    await page.waitForSelector("._2GBWeup5cttgbTw8FM3tfx");

    const inputs = await page.$$("._2GBWeup5cttgbTw8FM3tfx");
    if (inputs.length > 0) {
        await inputs[0].type(user);
        console.log(chalk.green(`✅ Successfully input username`));
    } else {
        console.log(chalk.red(`❌ Failed to input username`));
    }

    if (inputs.length > 1) {
        await inputs[1].type(pass);
        console.log(chalk.green(`✅ Successfully input password`));
    } else {
        console.log(chalk.red(`❌ Failed to input password`));
    }

    await page.click(".DjSvCZoKKfoNSmarsEcTS");
    console.log(chalk.yellow(`🚪 Clicked Login. Waiting for PIN input...`));

    return page;
}

async function submitPin(page, pin) {
    await page.waitForSelector("._3xcXqLVteTNHmk-gh9W65d", { timeout: 60000 });
    const inputs2 = await page.$$("._3xcXqLVteTNHmk-gh9W65d");
    try {
        if (inputs2.length > 0) {
            await inputs2[0].type(pin);
            console.log(chalk.green(`✅ Successfully input PIN`));

            await sleep(10000);
            try {
                await page.waitForSelector("._1jW5_Ycv6jGKu28A1OSIQK", { timeout: 3000 });
                console.log(chalk.green(`✅ Successfully access account`));
                return 0
            } catch (error) {
                if (error.name === 'TimeoutError') {
                    console.log(chalk.red(`❌ Wrong PIN`));
                    await sleep(2000);
                    for (let i = 0; i < 5; i++) {
                        await inputs2[i].press('Backspace');
                    };
                    return 1
                } else {
                    console.error("An unexpected error occurred:", error);
                }
            }
        } else {
            console.log(chalk.red(`❌ PIN input field not found`));
        }
    } catch (err) {
        console.log(chalk.red(`❌ Error while waiting for PIN input field: ${err.message}`));
    }
    return 0
}

module.exports = { steamLogin, submitPin };
