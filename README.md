# Arknights Global Gacha Helper App / 明日方舟國際服抽卡紀錄助手

A mobile application built with React Native (Expo) to assist in automatically extracting authentication tokens and fetching gacha records via official APIs from the Arknights Global servers (Yostar EN, JP, KR). The records are safely sent to the [Arknights Global Gacha Analyze](https://github.com/kaihuang1122/Firebase-global-arknightsgacha) web application for generating statistical dashboards.

行動端的明日方舟國際服（英、日、韓服）抽卡紀錄分析助手，基於 React Native (Expo) 開發的 WebView 自動化提取工具，能夠協助您安全地經由官方 API 獲取抽卡紀錄，並傳送至您的統計分析服務器。

## 🎯 Core Features / 核心功能
* Automatically loads the official Yostar login page (Supports EN, JP, KR servers). / 自動載入 Yostar 官方登入頁面 (支援 EN, JP, KR 伺服器)
* Uses an injected script to automatically extract login credentials and fetch gacha records via the official API. / 利用注入腳本自動提取登入憑證並經由官方 API 獲取抽卡紀錄
* Seamlessly generates a data form and POSTs it to the analyzer website, achieving a smooth one-click gacha record merging experience on mobile. / 無縫生成資料表單並 POST 至分析網站，達成在手機上一鍵合併抽卡紀錄的順暢體驗。

## 🚀 Development & Execution / 開發與執行

### Local Testing (Expo Go) / 本機開發測試
```bash
npm install
npm start
```
Scan the QR code in the terminal to preview and test instantly using the Expo Go App on your mobile device.
掃描終端機出現的 QR Code，即可透過手機上的 Expo Go App 進行即時預覽與測試。

### Automated Builds (GitHub Actions) / 自動化編譯
This project is configured with a complete GitHub CI/CD workflow, eliminating the need to set up an Android development environment locally!
本專案已配置完整的 GitHub CI/CD 工作流程，不需在本機建置 Android 開發環境！

Whenever a commit with a version tag is pushed, the GitHub server will automatically build the `.apk` file and publish it on the Releases page:
只要發布包含版本號標籤 (Tag) 的提交，GitHub 伺服器就會自動幫您打包成 `.apk` 檔，並發布在 Releases 頁面：
```bash
# Tag the current commit with v1.0.0 / 給當前進度打上 v1.0.0 標籤
git tag v1.0.0

# Push the tag to GitHub (triggers build and release) / 將標籤推送到 GitHub (將觸發自動編譯與發布)
git push origin v1.0.0
```
In about 3 minutes, you can download `Arknights-Global-Gacha-Helper-v1.0.0.apk` from the GitHub Releases section.
約 3 分鐘後，即可在 GitHub 的 Releases 區塊下載 `Arknights-Global-Gacha-Helper-v1.0.0.apk`。

## Privacy & Data Collection / 隱私權規範

The application requires fetching your authentication status on the official domain. We DO NOT persistently store your tokens on any third-party databases, and we DO NOT share your data with advertisers. For details, please review our full Privacy Policy at the related web repository.
本應用程式需要讀取您於官方網域下的驗證狀態。我們絕不會將您的 Cookie 或 Token 明文儲存於任何資料庫，亦不作其他無關用途或販售給第三方。詳細規範請參考主專案綁定的隱私權政策。

---

## Disclaimer & Copyright / 免責與版權聲明

1. This application and its author are not affiliated with, endorsed by, or authorized by the game's developers or publishers (including Hypergryph, Longcheng, Ariel, Yostar, or Studio Montagne).
1. 本應用程式與遊戲開發商或發行商（如鷹角網路、龍成網路、艾瑞爾網路、悠星網路或蒙塔山工作室）無任何關聯，也未經其授權。

2. The original source code of this application is licensed under the MIT License. However, all in-game assets, concepts, and intellectual properties associated with "Arknights" are strictly for personal and academic research. Any commercial use or resale utilizing the "Arknights" IP is strictly prohibited. Users engaging in such infringing behavior will bear full legal responsibility.
2. 本應用程式的原創底層程式碼採 MIT 授權開源。但任何與「明日方舟」相關的介面設計與美術素材，僅供學術與個人研究，**嚴禁將本開發套件基於明日方舟的型態進行任何商業用途或轉售**。任何侵犯版權的商業行為須由使用者自行負擔完全之法律責任。
