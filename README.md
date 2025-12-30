# todo-app-next

## 概要

ToDoアプリケーションのフロントエンドです。Next.jsのSSR（サーバーサイドレンダリング）を採用し、BFF（Backend For Frontend）パターンとして機能します。

## 主な機能

- ユーザー認証（Keycloak SSO、Google OAuth対応）
- ToDoの作成・編集・削除・一覧表示
- ToDoへの画像添付
- ユーザープロフィール管理（アバター画像アップロード）
- レスポンシブデザイン（Material-UI）

## 技術スタック

- **Next.js**: 15.5.8
- **React**: 19.0.0
- **TypeScript**: 5.x
- **Material-UI**: 7.3.4
- **Emotion**: スタイリング
- **Tailwind CSS**: 4.x
- **Keycloak-js**: 26.2.1（認証）
- **jose**: 6.0.11（JWT処理）
- **Zod**: 4.1.12（バリデーション）

## 前提条件

- Node.js >= 18.x
- npm または yarn

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd todo-app-next
```

### 2. 環境変数設定

`.env.sample` から `.env` を作成してください。

```bash
cp .env.sample .env
```

環境変数の詳細は各環境に応じて設定してください。

### 3. 依存関係のインストール

```bash
npm install
```

## 開発サーバーの起動

```bash
npm run dev
```

開発サーバーは `http://localhost:3000` で起動します。

### デバッグモード

```bash
npm run dev:debug
```

デバッガーは `0.0.0.0:9229` でリッスンします。

## API連携

バックエンド（`todo-app-express`）および認証基盤（`app-authentication`）との連携方法については、以下を参照してください。

- [API連携ドキュメント](./docs/api/integration.md)

## ビルド

```bash
npm run build
```

ビルド成果物は `.next/` ディレクトリに生成されます。

## 本番環境起動

```bash
npm run start
```

ビルド済みアプリケーションを本番モードで起動します。

## ディレクトリ構成

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証関連ページ
│   │   ├── login/
│   │   ├── register/
│   │   ├── callback/
│   │   ├── verify_account/
│   │   ├── forgot_password/
│   │   └── reset_password/
│   ├── (dashboard)/       # ダッシュボード（認証後）
│   │   ├── dashboard/
│   │   ├── todo/
│   │   └── profile/
│   ├── actions/           # Server Actions
│   └── health/            # ヘルスチェックエンドポイント
├── hooks/                 # カスタムフック
│   └── api/               # API通信用フック
├── services/              # 外部サービス連携
└── ...
```

## デプロイ

ECS へのデプロイは `todo-app-infrastructure` リポジトリで管理されています。

詳細は [todo-app-infrastructure](../todo-app-infrastructure) を参照してください。

## 関連リポジトリ

- [todo-app-infrastructure](../todo-app-infrastructure): インフラストラクチャ（Terraform）
- [todo-app-express](../todo-app-express): バックエンド（Express）
- [app-authentication](../app-authentication): 共通認証基盤（Keycloak）
