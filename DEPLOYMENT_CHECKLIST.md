# 🚀 UpWork Terminal MVP - デプロイメント チェックリスト

**作成日**: 2026-01-08 (セッション2)
**ステータス**: 🔴 **デプロイメント開始 - 認証待機中**

---

## ✅ 完了したステップ

- [x] コード実装: 15/15 Issues (100%)
- [x] ユニットテスト: 5/5 成功
- [x] ESLint 修正: 完了
- [x] ビルド検証: 成功 (0 errors)
- [x] Git コミット: 完了 (commit 4899dcf)
- [x] Vercel CLI インストール: 完了 (v50.1.6)
- [x] 環境変数設定: Supabase PostgreSQL 接続確認済み

---

## ⏳ 次のステップ (ユーザー対応必須)

### **ステップ 1: GitHub 認証エラーを解決**

**現在の問題**:
```
fatal: Permission to sholnk/upwork-terminal.git denied to otsu5
```

**解決方法 (3つの選択肢)**:

#### **オプション A: GitHub Personal Access Token (推奨)**
```bash
# 1. https://github.com/settings/tokens にアクセス
# 2. Generate new token (classic)
# 3. Scopes: repo (full), gist
# 4. Token をコピー

# 5. Git に設定
git config --global credential.helper store
git push origin master
# Username: <GitHub username>
# Password: <Token をペースト>
```

#### **オプション B: SSH キー設定**
```bash
# リポジトリオーナー (sholnk) として SSH キーを設定
ssh-keygen -t ed25519 -C "your.email@example.com"
git remote set-url origin git@github.com:sholnk/upwork-terminal.git
git push origin master
```

#### **オプション C: Vercel CLI 直接デプロイ (GitHub 不要)**
```bash
# GitHub push なしで Vercel へ直接デプロイ
# (手順は下記の "ステップ 2" を参照)
```

---

### **ステップ 2: Vercel にログイン**

```bash
# Vercel アカウントでログイン
cd /c/Users/SH/dev/wp/upwork-terminal

# ブラウザで認証が開く
vercel login
```

**実行後の確認**:
```bash
vercel whoami
# Output: your-vercel-username
```

---

### **ステップ 3: Vercel プロジェクト をリンク**

```bash
cd /c/Users/SH/dev/wp/upwork-terminal

# プロジェクトをリンク
vercel link

# プロンプト:
# ✔ Set up and deploy "upwork-terminal"? [Y/n] → Y
# ✔ Which scope should contain your project? → <your scope>
# ✔ Link to existing project? [y/N] → N (新規作成)
# ✔ What's your project's name? → upwork-terminal
# ✔ In which directory is your code? → ./ (or current)
```

---

### **ステップ 4: Vercel 環境変数を設定**

```bash
vercel env pull

# または UI で設定:
# https://vercel.com/dashboard/projects

# 環境変数:
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
SINGLE_USER_ID=cmk241jqc0000aq6tfn3ud034
INBOX_WEBHOOK_TOKEN=inbox-webhook-token-...
GITHUB_TOKEN=ghp_...
UPWORK_CLIENT_ID=<取得予定>
UPWORK_CLIENT_SECRET=<取得予定>
NEXT_PUBLIC_API_URL=https://upwork-terminal.vercel.app
```

---

### **ステップ 5: 初回デプロイ実行**

```bash
cd /c/Users/SH/dev/wp/upwork-terminal

# プレビューデプロイ (テスト)
vercel deploy

# 本番デプロイ
vercel deploy --prod
```

---

## 📋 必要な認証情報

| 項目 | 状態 | 説明 |
|------|------|------|
| **GitHub** | ❌ 要設定 | Personal Access Token または SSH キー |
| **Vercel** | ❌ 要ログイン | Vercel アカウント |
| **Supabase** | ✅ 設定済み | DATABASE_URL が .env に設定済み |
| **Anthropic API** | ✅ 設定済み | ANTHROPIC_API_KEY が .env に設定済み |

---

## 🎯 推奨スケジュール

| 時刻 | タスク | 所要時間 |
|------|--------|--------|
| **Now** | GitHub 認証をセットアップ | 5-10分 |
| **Now + 10分** | Vercel ログイン & リンク | 5分 |
| **Now + 15分** | 環境変数を確認/設定 | 5分 |
| **Now + 20分** | 初回デプロイ実行 | 3-5分 |

---

## 🚀 デプロイ後の確認

デプロイが成功したら以下を確認：

```bash
# 1. Vercel デプロイログを確認
vercel logs <deployment-url>

# 2. 本番環境にアクセス
https://upwork-terminal.vercel.app

# 3. API エンドポイント動作確認
curl https://upwork-terminal.vercel.app/api/jobs

# 4. ブラウザで動作確認
- ホームページ読み込み
- コンソールエラーなし
- 各ページにアクセス可能
```

---

## 📞 トラブルシューティング

### **GitHub 認証エラー**
```
fatal: Permission denied (otsu5)
```
→ GitHub トークンを再設定するか SSH キーを設定してください

### **Vercel デプロイエラー**
```
Build failed
```
→ `npm run build` をローカルで実行して確認してください

### **Environment variables not found**
```
Error: DATABASE_URL is not set
```
→ Vercel UI または `vercel env pull` で環境変数を設定してください

---

## ✨ デプロイ完了後のタスク

- [ ] 本番環境の動作確認
- [ ] Sentry 統合確認
- [ ] カスタムドメイン設定 (optional)
- [ ] GitHub Actions CI/CD パイプライン確認
- [ ] モニタリング ダッシュボード設定

---

**次のアクション**: ステップ 1 (GitHub 認証) から開始してください

セッション3 での継続実施予定。

---

*デプロイメント チェックリスト - セッション2 終了時点での状態*
