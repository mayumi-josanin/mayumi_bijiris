# Mayumi Bijiris Survey App

アンケート回答アプリとアンケート管理アプリをまとめた Web アプリです。独自 Node.js API でアンケートと回答を保存し、PWA としてスマホのホーム画面に追加できます。

## ファイル

- `index.html`: アプリ本体
- `styles.css`: 画面デザイン
- `app.js`: 回答、履歴、管理、アンケート作成機能
- `server.js`: 独自 API と静的ファイル配信
- `manifest.webmanifest`: スマホ追加用の PWA 設定
- `sw.js`: オフライン起動用の Service Worker
- `render.yaml`: Render へ公開するための設定例
- `start-macbook.command`: MacBook で院内用に起動するファイル

## 使い方

1. Node.js 18 以上を用意します。
2. 必要に応じて `.env.example` を参考に環境変数を設定します。
3. サーバーを起動します。

```bash
npm start
```

4. ブラウザで `http://localhost:3000` を開きます。
5. お客様は「回答アプリ」でお客様情報を保存してからアンケートに回答します。
6. 管理者は「管理アプリ」からログインします。

開発用の初期管理者ログイン:

- ID: `admin`
- PASS: `admin123`

公開運用では `ADMIN_USERNAME` と `ADMIN_PASSWORD` を必ず変更してください。

## 院内 Wi-Fi で使う

MacBook を院内 Wi-Fi に接続した状態で、`start-macbook.command` をダブルクリックします。ターミナルに次のような URL が表示されます。

```text
Same Wi-Fi customer URLs:
- http://192.168.x.x:3000/?app=customer

Same Wi-Fi admin URLs:
- http://192.168.x.x:3000/?app=admin
```

お客様には `Customer URL` を案内します。管理者は MacBook で `Admin URL` を開きます。

MacBook とお客様のスマホは同じ Wi-Fi に接続してください。Mac のファイアウォール確認が出た場合は Node.js の受信接続を許可してください。

## データ保存

回答データとアンケートは API サーバー側の `data/db.json` に保存されます。公開運用では永続ディスク付きのサーバーに配置してください。

ブラウザ側には、お客様情報と管理者ログイントークンのみ保存します。

## デプロイ

GitHub へ反映する場合は、次のコマンドを使います。

```bash
./deploy.sh "変更内容のメモ"
```

GitHub Pages は静的ファイルのみ対応のため、独自 API は動きません。公開アプリとして使う場合は、Render、Railway、VPS など Node.js サーバーを動かせる場所へこのリポジトリをデプロイしてください。

Render では `render.yaml` を使えます。環境変数として最低限次を設定してください。

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- `DATA_DIR=/var/data`

## スマホに追加

公開 URL をスマホのブラウザで開きます。

- iPhone: 共有ボタンから「ホーム画面に追加」
- Android: ブラウザの案内またはメニューから「アプリをインストール」

院内 Wi-Fi 運用では、お客様用 URL は `http://192.168.x.x:3000/?app=customer` のような形式になります。
