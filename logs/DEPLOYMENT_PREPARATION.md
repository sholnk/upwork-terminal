# 🚀 UpWork Terminal MVP - デプロイ準備ガイド

**作成日**: 2026-01-08 (セッション2)
**ステータス**: ⏳ **デプロイ前準備フェーズ**

---

## 📋 デプロイ前チェックリスト

### ✅ 技術的準備（完了）

- [x] Next.js ビルド成功
- [x] TypeScript 型チェック成功
- [x] ユニットテスト全て成功 (5/5)
- [x] GitHub Actions ワークフロー設定済み
- [x] 本番ビルド確認済み
- [x] 27ルート生成確認済み

### ⏳ 環境準備（要実施）

- [ ] Vercel アカウント作成 / ログイン
- [ ] GitHub リポジトリ接続
- [ ] 環境変数設定
- [ ] GitHub Secrets 設定
- [ ] Sentry アカウント設定
- [ ] PostgreSQL データベース設定

---

## 🔧 必要な環境変数

### 本番環境 (.env.production)

```bash
# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx

# Upwork OAuth
UPWORK_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxx
UPWORK_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
UPWORK_CALLBACK_URL=https://yourdomain.com/api/auth/upwork/callback

# Database
DATABASE_URL=postgresql://user:password@db.provider.com:5432/dbname

# Inbox Webhook
INBOX_WEBHOOK_TOKEN=inbox-webhook-token-prod-xxxxx

# Single User Mode (MVP)
SINGLE_USER_ID=user_default

# API Configuration
NEXT_PUBLIC_API_URL=https://yourdomain.com

# Error Tracking
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# NextAuth
NEXTAUTH_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXTAUTH_URL=https://yourdomain.com
```

---

## 🔑 GitHub Secrets 設定

GitHub リポジトリの Settings → Secrets に以下を追加：

```yaml
# Vercel デプロイ認証
VERCEL_TOKEN:       # https://vercel.com/account/tokens で取得
VERCEL_PROJECT_ID:  # Vercel プロジェクトID
VERCEL_ORG_ID:      # Vercel Organization ID

# Sentry エラートラッキング
SENTRY_AUTH_TOKEN:  # Sentry の API トークン
SENTRY_DSN:         # Sentry DSN URL
```

### 取得方法

**1. Vercel Token 取得**
```bash
1. https://vercel.com/account/tokens にアクセス
2. "Create" ボタンをクリック
3. Token コピー
4. GitHub Secret として VERCEL_TOKEN に追加
```

**2. Vercel Project ID 取得**
```bash
1. Vercel ダッシュボード → プロジェクト選択
2. Settings → General → Project ID コピー
3. GitHub Secret として VERCEL_PROJECT_ID に追加
```

**3. Sentry Token 取得**
```bash
1. https://sentry.io にアクセス / ログイン
2. Settings → API Tokens
3. New Token 作成
4. GitHub Secret として SENTRY_AUTH_TOKEN に追加
```

---

## 📦 Vercel デプロイ手順

### ステップ 1: リポジトリをプッシュ

```bash
cd /c/Users/SH/dev/wp/upwork-terminal

# git リポジトリが無い場合は初期化
git init
git add .
git commit -m "Initial commit: UpWork Terminal MVP"
git remote add origin https://github.com/sholnk/upwork-terminal.git
git branch -M main
git push -u origin main
```

### ステップ 2: GitHub で Secrets 設定

```bash
Settings → Secrets and variables → Actions → New repository secret

# 以下を順番に追加:
- VERCEL_TOKEN
- VERCEL_PROJECT_ID
- VERCEL_ORG_ID
- SENTRY_AUTH_TOKEN
```

### ステップ 3: 環境変数を Vercel に設定

**方法A: Vercel UI 経由**
```
Vercel Dashboard → Project → Settings → Environment Variables
以下を追加:
- DATABASE_URL
- ANTHROPIC_API_KEY
- UPWORK_CLIENT_ID
- UPWORK_CLIENT_SECRET
- INBOX_WEBHOOK_TOKEN
- NEXT_PUBLIC_API_URL
- SENTRY_DSN
```

**方法B: Vercel CLI 経由**
```bash
npm install -g vercel
vercel link

# 対話的に環境変数を設定
vercel env add ANTHROPIC_API_KEY
vercel env add DATABASE_URL
# ... 他の変数も同じ手順
```

### ステップ 4: 初回デプロイ

```bash
# GitHub Actions ワークフローがトリガーされる
# または手動で:
vercel deploy --prod
```

---

## 🗄️ PostgreSQL データベース設定

### 選択肢

| サービス | 特徴 | 推奨 |
|--------|------|------|
| **Railway.app** | $5/月無料トライアル | ✅ 初心者向け |
| **Supabase** | PostgreSQL + Auth | ✅ フル機能 |
| **Neon** | Serverless + Free tier | ✅ スケーラブル |
| **AWS RDS** | マネージドDB | 本番環境向け |

### Railway.app でのセットアップ

```bash
1. https://railway.app にアクセス
2. GitHub でログイン
3. New Project → Provision PostgreSQL
4. DATABASE_URL をコピー
5. Vercel Environment に貼り付け
```

### Supabase でのセットアップ

```bash
1. https://supabase.com にアクセス
2. New Project 作成
3. Database → Connection string コピー
4. DATABASE_URL を設定
5. SUPA_... 認証トークンも追加 (if using Auth)
```

---

## 🔄 CI/CD パイプライン確認

### GitHub Actions ワークフロー (.github/workflows/deploy.yml)

**トリガー条件**
```yaml
on:
  push:
    branches: [main]        # main ブランチへの push
  pull_request:
    branches: [main]        # main へのプルリクエスト
```

**実行ジョブ**

1. **Test Job** (main ブランチへの push 時)
   ```
   - Node.js 20 セットアップ
   - npm ci
   - npm run lint
   - npm run typecheck
   - npm test
   - npm run build
   ```

2. **Deploy Job** (Test 成功後かつ main push 時)
   ```
   - Vercel デプロイ
   - VERCEL_TOKEN で認証
   - --prod フラグで本番環境へ
   ```

3. **Monitor Job** (push 時)
   ```
   - Sentry デプロイ通知
   ```

---

## 🔐 セキュリティ設定

### CORS 設定

```typescript
// src/app/api/middleware.ts (未実装、推奨)
const ALLOWED_ORIGINS = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
];

export function corsMiddleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (ALLOWED_ORIGINS.includes(origin)) {
    return new NextResponse(null, {
      headers: {
        'Access-Control-Allow-Origin': origin,
      },
    });
  }
  return NextResponse.next();
}
```

### レート制限

```typescript
// src/lib/rate-limit.ts (未実装、推奨)
import { Ratelimit } from '@upstash/ratelimit';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'),
});
```

---

## 📊 Sentry 統合設定

### 1. Sentry アカウント作成

```bash
https://sentry.io
- GitHub で新規作成 / ログイン
- Organization 作成
- Next.js プロジェクト作成
```

### 2. Sentry DSN 取得

```
Project Settings → Client Keys (DSN)
DSN format: https://xxxx@xxxx.ingest.sentry.io/xxxxx
```

### 3. 環境変数に設定

```bash
SENTRY_DSN=https://xxxx@xxxx.ingest.sentry.io/xxxxx
```

### 4. Sentry SDK 初期化 (既実装)

```typescript
// src/lib/monitoring/logger.ts
if (process.env.SENTRY_DSN) {
  // Sentry エラーレポーティング設定済み
}
```

---

## 📈 デプロイ後のチェック

### デプロイ後ホームページ

```
https://yourdomain.com
- ✅ ページ読み込み確認
- ✅ コンソールエラーなし
```

### API エンドポイント動作確認

```bash
# Jobs API テスト
curl -X GET https://yourdomain.com/api/jobs

# Inbox API テスト
curl -X GET https://yourdomain.com/api/inbox/messages

# Health Check
curl https://yourdomain.com/api/health (要実装)
```

### モニタリング確認

```bash
1. Sentry Dashboard → Issues
   - エラーキャプチャされているか確認

2. Vercel Analytics
   - ページ読み込み時間確認
   - Core Web Vitals 確認
```

---

## 🔗 参考リンク

| リソース | URL |
|--------|-----|
| **Vercel Docs** | https://vercel.com/docs |
| **Next.js Deploy** | https://nextjs.org/learn-pages-router/basics/deployment |
| **GitHub Actions** | https://docs.github.com/en/actions |
| **Sentry Docs** | https://docs.sentry.io/ |
| **PostgreSQL** | https://www.postgresql.org/docs/ |

---

## ⚠️ 注意事項

### セキュリティ

1. **環境変数は GitHub に commit しない**
   ```bash
   .env.local は .gitignore に含まれている確認
   ```

2. **Database URL は秘密**
   ```bash
   GitHub Secrets に管理
   ```

3. **API Keys のローテーション**
   ```bash
   定期的 (3-6ヶ月) に更新推奨
   ```

### パフォーマンス

1. **Cold Starts**
   - Vercel のサーバーレス関数初回起動時に遅延
   - 解決: 定期的に API を ping

2. **Database Connections**
   - PostgreSQL コネクションプーリング設定推奨
   - Prisma PrismaClient 最適化設定済み

3. **Static Generation**
   - ISR (Incremental Static Regeneration) 設定済み
   - next.config.js で最適化済み

---

## 📋 デプロイチェックリスト (実施順)

```
[ ] 1. GitHub リポジトリに push
[ ] 2. GitHub Secrets 設定 (VERCEL_* など)
[ ] 3. Vercel Project 作成 / 接続
[ ] 4. PostgreSQL DB セットアップ
[ ] 5. 環境変数を Vercel に設定
[ ] 6. GitHub Actions ワークフロー実行確認
[ ] 7. Vercel デプロイログ確認
[ ] 8. 本番環境で API テスト実施
[ ] 9. Sentry エラートラッキング確認
[ ] 10. 本番環境 URL を共有
```

---

## 🎯 推奨スケジュール

| 時期 | タスク |
|------|--------|
| **本日** | GitHub Secrets 設定, Vercel 作成 |
| **明日** | DB セットアップ, 初回デプロイ |
| **1週間以内** | 本番環境テスト, 微調整 |
| **2週間以内** | ベータテスト, フィードバック収集 |
| **1ヶ月** | GA (General Availability) リリース |

---

**準備完了日**: 2026-01-08
**次のアクション**: GitHub リポジトリへのプッシュ → Vercel 設定開始

---

*デプロイ準備ガイド - セッション2 作成*
