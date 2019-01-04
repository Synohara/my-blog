---
title: サーバーレスWithをする
description: "elasticsearch-sudachi をローカル環境で試してみたかったので Docker でサクッと Elasticsearch と Kibana を起動してみました。"
slug: six
---

どうも。今日はサーバーレス With です。Lambda で With 巡回スクリプトを動かします。puppeteer の練習の為に作ってみました。
lambda に chrome のバイナリが入りきらないのでちょっと工夫する必要があります。

``` javascript
const launchChrome = require("@serverless-chrome/lambda");
const CDP = require("chrome-remote-interface");
const puppeteer = require("puppeteer");

exports.handler = async (event, context, callback) => {
  try {
    const slsChrome = await launchChrome();
    const browser = await puppeteer.connect({
      browserWSEndpoint: (await CDP.Version()).webSocketDebuggerUrl
    });
    const context = browser.defaultBrowserContext();
    const page = await context.newPage();
    await page.goto("https://facebook.com", { waitUntil: "domcontentloaded" });
    console.log("Now on login page");
    // ユーザー名・パスワードを入力する
    await page.type("#email", ${Facebookに登録しているメールアドレス});
    await page.type("#pass", ${パスワード});
    // ログインボタンをクリックする
    await page.click("#loginbutton");
    // スクショを撮る
    // await page.screenshot({ path: "facebook.png", fullPage: true });

    await page.goto("https://with.is", { waitUntil: "domcontentloaded" });
    await page.click('a[href^="/auth/facebook"]');
    for (var i = 0; i < 50; i++) {
      await page.evaluate(_ => {
        window.scrollBy(0, window.innerHeight);
      });
      await page.waitFor(3000);
    }
    // await page.screenshot({ path: "with.png", fullPage: true });
    let listSelector = "a.link-area";
    var list = await page.$$(listSelector);
    var data = [];
    for (let i = 0; i < list.length; i++) {
      data.push(await (await list[i].getProperty("href")).jsonValue());
    }
    console.log("訪問数は" + data.length.toString() + "やで");
    for (let i = 0; i < data.length; i++) {
      await page.goto(data[i], { waitUntil: "domcontentloaded" });
      console.log(i);
      console.log(data[i]);
      // await page.screenshot({
      //   path: "screenshot/" + i.toString() + ".png",
      //   fullPage: true
      // });
    }
    await browser.close();
  } catch (err) {
    return callback(err);
  }
};
```

このスクリプトを lambda にアップロードします。あとは Cloudwatch Events やらなんやらで定期的に発動するようにすればサーバーレス With の完成です。
