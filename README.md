# Mayumi Bijiris Survey App

まゆみ助産院で使うアンケート Web アプリです。お客様はスマホからお客様アプリに回答し、管理者は別の管理アプリで回答を確認・管理します。

## ファイル

- `customer-app/`: お客様に共有するアンケート回答アプリ
- `admin-app/`: 管理者が回答を管理するアプリ
- `shared/`: お客様アプリと管理アプリで共通利用する API 接続コード
- `index.html`: アプリ選択用の案内ページ
- `server.js`: 独自 API と静的ファイル配信
- `default-surveys.js`: 初期アンケート定義
- `data/`: 回答データを保存する場所
- `start-macbook.command`: MacBook で院内用に起動するファイル

## 使い方

無料運用では Firebase Spark プランの Firestore に回答を保存します。GitHub Pages 上のお客様アプリと管理アプリは、`shared/firebase-config.js` に Firebase 設定が入っている場合、Firestore へ直接接続します。

- お客様アプリ: `https://mayumi-josanin.github.io/mayumi_bijiris/customer-app/`
- 管理アプリ: `https://mayumi-josanin.github.io/mayumi_bijiris/admin-app/`

Render などで Node.js API を起動する場合は、API サーバー側の同一URLでも使えます。

- お客様アプリ: `https://mayumi-bijiris.onrender.com/customer-app/`
- 管理アプリ: `https://mayumi-bijiris.onrender.com/admin-app/`

ローカルで確認する場合:

1. Node.js 18 以上を用意します。
2. 必要に応じて `.env.example` を参考に環境変数を設定します。
3. サーバーを起動します。

```bash
npm start
```

4. ブラウザで `http://localhost:3000/customer-app/` または `http://localhost:3000/admin-app/` を開きます。
5. お客様は `customer-app` でお客様情報を保存してからアンケートに回答します。
6. 管理者は `admin-app` でログインして回答を確認・管理します。

ローカル開発用の初期管理者ログイン:

- ID: `admin`
- PASS: `admin123`

公開運用では `ADMIN_USERNAME` と `ADMIN_PASSWORD` を必ず変更してください。

## 無料の保存先設定

Firebase Spark プランを使う場合は、Firebase コンソールで次を設定します。

1. Firebase プロジェクトを作成します。
2. Authentication で「匿名」と「メール/パスワード」を有効にします。
3. 管理者用のメールアドレスとパスワードを Authentication に登録します。
4. Firestore Database を作成します。
5. Firestore Rules に `firebase/firestore.rules` の内容を貼り付けて公開します。
6. Web アプリを追加し、表示された Firebase config を `shared/firebase-config.js` に貼り付けます。
7. `./deploy.sh "Update Firebase config"` で GitHub Pages に反映します。

Firebase 設定後は、GitHub Pages のお客様アプリから回答保存でき、管理アプリで集計・確認できます。

Firebase 設定が空の間もお客様アプリには3つのアンケートが表示されますが、回答保存と管理アプリの集計には Firebase 設定が必要です。

## 公開サーバー設定

Render にこのリポジトリを接続すると、`render.yaml` の設定で Node.js API とアプリ配信を起動できます。Render 側で次の環境変数を設定してください。

- `ADMIN_USERNAME`: 管理アプリのログインID
- `ADMIN_PASSWORD`: 管理アプリのパスワード
- `SESSION_SECRET`: 管理ログイン用の秘密キー
- `DATA_DIR=/var/data`

回答データは Render の永続ディスク `survey-data` に保存します。

Render のサービスURLを変更した場合は、アプリURLの末尾に `?apiBase=https://変更後のURL` を付けて一度開くと、その端末に接続先が保存されます。

## 院内 Wi-Fi で使う

MacBook を院内 Wi-Fi に接続した状態で、`start-macbook.command` をダブルクリックします。ターミナルに次のような URL が表示されます。

```text
Same Wi-Fi customer app URLs:
- http://192.168.x.x:3000/customer-app/

Same Wi-Fi admin app URLs:
- http://192.168.x.x:3000/admin-app/
```

お客様には `customer-app` の URL だけを案内します。管理者は MacBook で `admin-app` の URL を開きます。

MacBook とお客様のスマホは同じ Wi-Fi に接続してください。Mac のファイアウォール確認が出た場合は Node.js の受信接続を許可してください。

## データ保存

回答データとアンケートは API サーバー側の `data/db.json` に保存されます。

ブラウザ側には、お客様情報と管理者ログイントークンのみ保存します。管理アプリでは回答の対応状況、管理メモ、削除、CSV 出力ができます。

初期アンケートは次の3種類です。

- ビジリス施術アンケート
- ビジリス回数券終了アンケート
- モニター終了アンケート

既存の `data/db.json` がある状態で、初期アンケート定義だけを最新内容に戻す場合は次を実行します。既存回答は保持されます。

```bash
npm run reset-surveys
```

写真質問はスマホから画像を選択できます。画像は送信時に縮小され、回答データと一緒に `data/db.json` に保存されます。

## デプロイ

GitHub へ反映する場合は、次のコマンドを使います。

```bash
./deploy.sh "変更内容のメモ"
```

GitHub Pages は静的ファイルのみ対応のため、独自 API は動きません。院内運用では MacBook の `npm start` または `start-macbook.command` を使います。

Render では `render.yaml` を使えます。環境変数として最低限次を設定してください。

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- `DATA_DIR=/var/data`

## スマホに追加

お客様用 URL をスマホのブラウザで開きます。

- iPhone: 共有ボタンから「ホーム画面に追加」
- Android: ブラウザの案内またはメニューから「アプリをインストール」

院内 Wi-Fi 運用では、お客様用 URL は `http://192.168.x.x:3000/customer-app/` のような形式になります。
