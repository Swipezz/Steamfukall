const user = "sugomadics"
const pass = "Heyakid157"



















const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // This will show the browser window
    defaultViewport: null, // Use the full window size
  });

  const page = await browser.newPage();
  await page.goto('https://store.steampowered.com/login/');

  // Wait for the input fields to be present on the page
  await page.waitForSelector('._2GBWeup5cttgbTw8FM3tfx'); // Wait for the first input field

  // Type into the first input element
  const inputs = await page.$$('._2GBWeup5cttgbTw8FM3tfx');
  
  // Check if we have the inputs
  if (inputs.length > 0) {
    await inputs[0].type(user);
    console.log('Typed into first input!');
  } else {
    console.log('Input fields not found.');
  }

  // Optionally, you can interact with the second input field
  if (inputs.length > 1) {
    await inputs[1].type(pass);
    console.log('Typed into second input!');
  } else {
    console.log('Second input field not found.');
  }

  page.click(".DjSvCZoKKfoNSmarsEcTS")
  console.log("Button clicked");
  

  // Optionally, wait and then close the browser
  await browser.close();
})();
