# API連携

## 概要

`todo-app-next` は、BFFパターンとして以下の2つの外部サービスと連携します。

1. **todo-app-express**: バックエンドAPI（ToDo管理、ユーザー管理）
2. **app-authentication (Keycloak)**: 認証・認可サービス

## バックエンドAPI連携

### 接続先

環境変数 `API_BASE_URL` でバックエンドAPIのベースURLを指定します。

```bash
# 開発環境（ローカル）
API_BASE_URL=http://localhost:3001

# ECS環境（Service Connect経由）
API_BASE_URL=http://backend.service.internal:3000
```

### 主要エンドポイント

#### ToDo関連

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | `/api/todo` | ToDo一覧取得 |
| GET | `/api/todo/:id` | ToDo詳細取得 |
| POST | `/api/todo` | ToDo作成 |
| PUT | `/api/todo/:id` | ToDo更新（画像アップロード対応） |

#### ユーザー関連

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | `/api/user` | ユーザー情報取得 |
| POST | `/api/user/login` | ログイン |
| POST | `/api/user/register` | ユーザー登録 |
| PUT | `/api/user` | ユーザー情報更新（アバター画像アップロード対応） |
| PUT | `/api/user/sso_sync` | SSOアカウント同期 |
| POST | `/api/user/reset_password/request` | パスワードリセット要求 |
| POST | `/api/user/reset_password/confirm` | パスワードリセット確認 |
| POST | `/api/user/verify/:token` | メールアドレス検証 |

### 認証ヘッダー

バックエンドAPIへのリクエストには、JWTトークンを `Authorization` ヘッダーに含めます。

```typescript
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
}
```

### エラーハンドリング

APIレスポンスのステータスコードに応じて適切なエラー処理を行います。

- `401 Unauthorized`: 認証エラー → ログイン画面へリダイレクト
- `403 Forbidden`: 権限エラー
- `404 Not Found`: リソースが見つからない
- `500 Internal Server Error`: サーバーエラー

## Keycloak認証連携

### 接続先

環境変数でKeycloakサーバーとクライアント設定を指定します。

```bash
KEYCLOAK_CLIENT_URL=https://dev.auth.ryo-okazaki.com
KEYCLOAK_FRONTEND_CLIENT_ID=todo-frontend-client
KEYCLOAK_REALM=common-auth-system
```

### 認証フロー

1. **ログインリクエスト**: Keycloakログインページへリダイレクト
2. **認証完了**: Keycloakから認可コードを受け取る
3. **トークン取得**: 認可コードをトークンに交換
4. **アクセストークン保存**: JWTトークンをセッションまたはCookieに保存
5. **API呼び出し**: アクセストークンを使ってバックエンドAPIを呼び出す

### Google OAuth連携

Keycloakを通じてGoogleアカウントでのログインが可能です。

1. Keycloakログイン画面で「Googleでログイン」を選択
2. Google認証画面へリダイレクト
3. Google認証完了後、Keycloakが自動的にアカウントを作成またはリンク
4. アクセストークンを取得してアプリケーションへ戻る

### トークンリフレッシュ

アクセストークンの有効期限が切れた場合、リフレッシュトークンを使用して新しいアクセストークンを取得します。

```typescript
// リフレッシュトークンでトークンを更新
const newToken = await keycloak.updateToken(30); // 30秒以内に期限切れならリフレッシュ
```

## 環境変数一覧

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `API_BASE_URL` | バックエンドAPIのベースURL | `http://localhost:3001` |
| `KEYCLOAK_CLIENT_URL` | KeycloakサーバーのベースURL | `https://dev.auth.ryo-okazaki.com` |
| `KEYCLOAK_FRONTEND_CLIENT_ID` | KeycloakクライアントID | `todo-frontend-client` |
| `KEYCLOAK_REALM` | Keycloak Realm名 | `common-auth-system` |
| `NEXT_PUBLIC_ASSET_PREFIX` | 静的アセット配信URL（CloudFront） | `https://cdn.dev.todo-app.ryo-okazaki.com` |
| `JWT_SECRET` | JWT署名検証用シークレット | (Secrets Managerから取得) |

## セキュリティ

- **HTTPS通信**: 本番環境では全てHTTPS通信を使用
- **CORS設定**: バックエンドAPIでCORS設定を適切に行う
- **トークン保存**: トークンはHTTPOnly Cookieまたはセキュアなセッションストレージに保存
- **XSS対策**: Next.jsの組み込みXSS対策を活用
- **CSRF対策**: CSRFトークンを使用してフォーム送信を保護
