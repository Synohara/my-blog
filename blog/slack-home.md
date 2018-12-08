---
title: お家の状況監視システムを作ろう！！
date: 2018-12-08 23:43:55
description: "我が家ではお家の状況をいつでもどこでも見たり、操作できるような**お家の状況監視システム**を完成させるべく日々お家ハックに勤しんでおります。そんな中で作ったものを今回はご紹介します。"
image: "https://i.imgur.com/qeKTrnD.jpg"
slug: forth
---
## お家の状況監視システムを作ろう！！

我が家ではお家の状況をいつでもどこでも見たり、操作できるような**お家の状況監視システム**を完成させるべく日々お家ハックに勤しんでおります。そんな中で作ったものを今回はご紹介します。

---

### Slackでお家のことを見守る君

Slackでお家のことを見守るシステム群です。Slackからお家の状態（温度とか色々）確認したい時ってありますよね？ そんな思いを実現するツールたちです。

#### 温度・湿度確認君

Slackで「温度」または「湿度」と書き込むとBotが温度か湿度を返してくれるという超絶便利な機能です。百聞は一見に如かず。ご覧ください。

![slack_home](../static/images/slack_home.gif)

いやー！超絶便利ですね！

#### 作り方

それでは温度・湿度確認君の作り方を解説します。

#### 準備するもの

ほとんど中華通販サイトから調達できます。

- [D1 mini](https://wiki.wemos.cc/products:d1:d1_mini)
    - いわゆるESP8266モジュールです
- [DHT Shield](https://wiki.wemos.cc/products:d1_mini_shields:dht_shield)
    - D1 mini専用のDHT12を搭載したシールドです
- Broadlink RM 3 Mini (aka Black Bean)
    - 通称「黒豆」AliExpressとかで売ってると思います
- Raspberry Pi 3
    - SlackのBotとBroadlink RM 3 Miniを操作するためのサーバーとして利用します。後述するpythonのslackbotライブラリとBlackBeanControlが動くマシンであればなんでもいいと思います。
#### 赤外線リモコン操作君

Slack で部屋の明かりをつけたり、消したりエアコンを操作してくれたりするすごいやつです。

### おまけ：テレビの予約とか喋ってくれる君
