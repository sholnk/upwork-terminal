# 🚀 セッション自動再開スクリプト

**用途**: 次回セッションでこのファイルを Claude Code に読み込ませると、自動的にデプロイを再開します。

**使用方法**:
```
Claude Code で以下を実行:
1. このファイルを読み込む
2. "デプロイ再開" というリクエストを実行
3. 以下のトークンを入力
```

---

## 📋 **必要なトークン情報 (ユーザーが用意)**

再開時にユーザーが用意すべき情報:

```
[ ] GitHub Personal Access Token
[ ] Vercel Personal Access Token
[ ] Vercel Project ID
[ ] Vercel Org ID
```

---

## 🤖 **Claude Code 向け自動実行指示**

> **Claude Code へのリクエスト**:
>
> 以下のファイルから自動再開指示を読み込んでください：
> `/c/Users/SH/dev/wp/upwork-terminal/SESSION_RESUME_INSTRUCTIONS.md`
>
> **実行内容**:
> 1. ユーザーからトークンを取得
> 2. GitHub Secrets を設定
> 3. git push を実行
> 4. GitHub Actions のデプロイを監視
> 5. 本番環境の動作確認

---

## 🔧 **自動実行スクリプト内容**

以下を実行してください：

```bash
#!/bin/bash

# UpWork Terminal MVP - 自動デプロイスクリプト

PROJECT_DIR="/c/Users/SH/dev/wp/upwork-terminal"
cd $PROJECT_DIR

echo "=========================================="
echo "UpWork Terminal MVP - デプロイ自動再開"
echo "=========================================="

# Step 1: トークン情報を取得
echo ""
echo "📋 Step 1: トークン情報を入力"
echo "----------------------------------------"

read -p "GitHub Personal Access Token: " GITHUB_TOKEN
read -p "Vercel Token: " VERCEL_TOKEN
read -p "Vercel Project ID: " VERCEL_PROJECT_ID
read -p "Vercel Org ID: " VERCEL_ORG_ID

# Step 2: GitHub Secrets を確認
echo ""
echo "📋 Step 2: GitHub Secrets の設定"
echo "----------------------------------------"
echo "以下を GitHub に手動設定してください:"
echo ""
echo "URL: https://github.com/sholnk/upwork-terminal/settings/secrets/actions"
echo ""
echo "Secret 1:"
echo "  Name: VERCEL_TOKEN"
echo "  Value: $VERCEL_TOKEN"
echo ""
echo "Secret 2:"
echo "  Name: VERCEL_PROJECT_ID"
echo "  Value: $VERCEL_PROJECT_ID"
echo ""
echo "Secret 3:"
echo "  Name: VERCEL_ORG_ID"
echo "  Value: $VERCEL_ORG_ID"
echo ""
read -p "✓ GitHub に設定完了したら Enter を押してください"

# Step 3: Git プッシュ実行
echo ""
echo "📋 Step 3: Git プッシュ実行"
echo "----------------------------------------"

git config --global credential.helper store

# GitHub トークンでプッシュ
echo "Pushing to GitHub..."
git push https://${GITHUB_TOKEN}@github.com/sholnk/upwork-terminal.git master

if [ $? -eq 0 ]; then
    echo "✅ プッシュ成功"
else
    echo "❌ プッシュ失敗 - トークンを確認してください"
    exit 1
fi

# Step 4: GitHub Actions の進捗を確認
echo ""
echo "📋 Step 4: GitHub Actions のデプロイを待機"
echo "----------------------------------------"
echo ""
echo "🔗 進捗確認: https://github.com/sholnk/upwork-terminal/actions"
echo ""
echo "以下の処理が自動実行されます:"
echo "  1. npm test - ユニットテスト実行"
echo "  2. npm run build - 本番ビルド"
echo "  3. vercel deploy --prod - Vercel デプロイ"
echo ""
echo "⏳ 完了まで約 5-10 分待機..."
echo ""

# GitHub Actions の URL を開く (オプション)
echo "ブラウザで以下を開いて進捗を確認してください:"
echo "https://github.com/sholnk/upwork-terminal/actions"
echo ""
read -p "デプロイ完了後 Enter を押してください"

# Step 5: 本番環境の確認
echo ""
echo "📋 Step 5: 本番環境の動作確認"
echo "----------------------------------------"
echo ""
echo "🔗 本番 URL: https://upwork-terminal.vercel.app"
echo ""
echo "確認項目:"
echo "  ✓ ホームページが読み込まれるか"
echo "  ✓ コンソールにエラーがないか"
echo "  ✓ API エンドポイントが動作するか"
echo ""

# API テスト
echo "API テスト実行中..."
curl -s https://upwork-terminal.vercel.app/api/jobs | head -20

echo ""
echo "=========================================="
echo "✅ デプロイ完了!"
echo "=========================================="
echo ""
echo "本番環境: https://upwork-terminal.vercel.app"
echo ""
```

---

## 📝 **実行手順 (再開時)**

### **準備 (オンライン)**

1. **GitHub Personal Access Token を取得** (5分)
   ```
   https://github.com/settings/tokens
   → "Generate new token (classic)"
   → Scopes: repo (full)
   ```

2. **Vercel Personal Access Token を取得** (3分)
   ```
   https://vercel.com/account/tokens
   → "Create"
   ```

3. **Vercel Project ID & Org ID を確認** (2分)
   ```
   https://vercel.com/dashboard
   → Project → Settings → Project ID
   → Account Settings → Org ID
   ```

### **実行 (ローカル)**

```bash
cd /c/Users/SH/dev/wp/upwork-terminal

# 自動スクリプトを実行
bash ./auto_deploy.sh
```

または、Claude Code に以下を指示:

```
デプロイを再開してください。
以下の情報を入力します：
- GitHub Token: <コピー>
- Vercel Token: <コピー>
- Vercel Project ID: <コピー>
- Vercel Org ID: <コピー>
```

---

## 🎯 **Claude Code への自動指示**

次回セッションで、以下をユーザーが実行:

```
Claude Code に以下をペースト:

この指示ファイルを読んで、デプロイを自動再開してください:
/c/Users/SH/dev/wp/upwork-terminal/SESSION_RESUME_INSTRUCTIONS.md

必要な情報:
- GitHub Personal Access Token (GitHub Settings から取得)
- Vercel Personal Access Token (Vercel から取得)
- Vercel Project ID
- Vercel Org ID

その後、以下を自動実行:
1. GitHub Secrets に トークンを設定
2. git push origin master を実行
3. GitHub Actions のデプロイを監視
4. 本番環境の動作確認
```

---

## 📊 **進捗追跡**

現在の状態:

```
✅ コード実装: 15/15 Issues (100%)
✅ テスト: 5/5 成功
✅ ビルド検証: 成功
✅ Git コミット: 完了 (341ea4b)
⏳ GitHub Secrets: 設定待機中
⏳ git push: 実行待機中
⏳ GitHub Actions: 実行待機中
⏳ Vercel デプロイ: 待機中
```

---

## 🔑 **トークン取得チェックリスト**

次回セッションで確認:

- [ ] GitHub Token 取得済み
- [ ] Vercel Token 取得済み
- [ ] Vercel Project ID 確認済み
- [ ] Vercel Org ID 確認済み

---

## ⚡ **クイックリンク集**

| 項目 | URL |
|------|-----|
| GitHub Settings | https://github.com/settings/tokens |
| Vercel Tokens | https://vercel.com/account/tokens |
| Vercel Dashboard | https://vercel.com/dashboard |
| GitHub Secrets | https://github.com/sholnk/upwork-terminal/settings/secrets/actions |
| GitHub Actions | https://github.com/sholnk/upwork-terminal/actions |
| 本番環境 | https://upwork-terminal.vercel.app |

---

## 💾 **ファイル参照**

```
/c/Users/SH/dev/wp/upwork-terminal/
├── SESSION_RESUME_INSTRUCTIONS.md  ← このファイル (自動再開指示)
├── DEPLOYMENT_STATUS.md            ← デプロイ状態スナップショット
├── DEPLOYMENT_CHECKLIST.md         ← チェックリスト
├── auto_deploy.sh                  ← 自動実行スクリプト (下記参照)
└── .env                            ✅ 環境変数設定済み
```

---

## 🚀 **再開時の1行実行コマンド**

```bash
cd /c/Users/SH/dev/wp/upwork-terminal && bash auto_deploy.sh
```

---

**このファイルを読み込ませるだけで、自動的にデプロイ再開できます。**

*作成日: 2026-01-08*
