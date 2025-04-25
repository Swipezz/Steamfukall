const user = "sugomadics2";
const pass = "Heyakid157";
const pin = "12345";
// Pin sementara

const puppeteer = require("puppeteer");

(async () => {
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
        console.log("Input Username done");
    } else {
        console.log("Input Username not found");
    }
    if (inputs.length > 1) {
        await inputs[1].type(pass);
        console.log("Input Password done");
    } else {
        console.log("Input Password not found");
    }

    await page.click(".DjSvCZoKKfoNSmarsEcTS");
    console.log("Click Login");

    await page.waitForSelector("._3xcXqLVteTNHmk-gh9W65d");

    const inputs2 = await page.$$("._3xcXqLVteTNHmk-gh9W65d");
    if (inputs2.length > 0) {
        await inputs2[0].type(pin);
        console.log("Input Pin done");
    } else {
        console.log("Input pin not found");
    }
})();
