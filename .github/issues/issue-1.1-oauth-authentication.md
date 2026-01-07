# Issue 1.1: OAuth 2.0 認証フロー

## 概要
UpWork GraphQL APIへのOAuth 2.0認証接続を確立する。

## 背景
UpWork Terminalの全機能はUpWork APIへのアクセスに依存する。
認証フローが完成しないと、プロフィール同期・案件取得等が不可能。

## 実装タスク

### 1. UpWork Developer Portal設定
- [ ] アプリケーション登録
- [ ] Client ID / Client Secret 取得
- [ ] リダイレクトURI設定 (`/api/auth/callback/upwork`)
- [ ] 必要なスコープ申請

### 2. 環境変数設定
```env
UPWORK_CLIENT_ID=xxx
UPWORK_CLIENT_SECRET=xxx
UPWORK_REDIRECT_URI=http://localhost:3000/api/auth/callback/upwork
```

### 3. 認証エンドポイント実装
- [ ] `GET /api/auth/upwork` - 認可開始（リダイレクト）
- [ ] `GET /api/auth/callback/upwork` - コールバック処理
- [ ] アクセストークン取得・保存

### 4. トークン管理
- [ ] `User.accessToken` にアクセストークン保存
- [ ] `User.refreshToken` にリフレッシュトークン保存
- [ ] `User.tokenExpiry` に有効期限保存
- [ ] 期限切れ時の自動リフレッシュ処理

### 5. UI実装
- [ ] 設定画面に「UpWorkと連携」ボタン追加
- [ ] 連携状態表示（連携中/未連携）
- [ ] 連携解除ボタン

## 受入条件
- [ ] 「UpWorkと連携」ボタンクリックでUpWork OAuth画面へ遷移
- [ ] 認可完了後、アプリにリダイレクトされトークンがDB保存される
- [ ] トークン有効期限切れ時に自動リフレッシュされる
- [ ] 連携状態がUIに正しく表示される

## 技術仕様

### UpWork OAuth 2.0 フロー
```
1. ユーザー → /api/auth/upwork
2. リダイレクト → https://www.upwork.com/ab/account-security/oauth2/authorize
3. ユーザー認可
4. コールバック → /api/auth/callback/upwork?code=xxx
5. コード → アクセストークン交換
6. トークン保存
```

### GraphQL エンドポイント
- Base URL: `https://api.upwork.com/graphql`
- 認証ヘッダー: `Authorization: Bearer {access_token}`

## 依存関係
- なし（Phase 1の最初のIssue）

## 参考資料
- [UpWork Developer Documentation](https://www.upwork.com/developer/)
- [OAuth 2.0 Spec](https://datatracker.ietf.org/doc/html/rfc6749)
