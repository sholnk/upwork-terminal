# 🚀 自動再開ガイド

**次回セッション開始時に、このファイルの指示に従ってください。**

---

## 📌 最も簡単な再開方法

### **ステップ 1: このテキストをコピー**

```
次回 Claude Code を開いたら、以下をそのまま実行リクエストとしてペーストしてください：

===== ここからコピー =====

デプロイを自動再開してください。

以下の手順で進めます：

1. /c/Users/SH/dev/wp/upwork-terminal/SESSION_RESUME_INSTRUCTIONS.md から自動再開指示を読み込む

2. ユーザーから以下のトークンを取得：
   - GitHub Personal Access Token (https://github.com/settings/tokens)
   - Vercel Token (https://vercel.com/account/tokens)
   - Vercel Project ID (https://vercel.com/dashboard)
   - Vercel Org ID (https://vercel.com/account/settings)

3. 自動実行スクリプトを実行：
   bash /c/Users/SH/dev/wp/upwork-terminal/auto_deploy.sh

4. GitHub Secrets 設定
5. git push を実行
6. GitHub Actions のデプロイを監視
7. 本番環境で動作確認

===== コピー終わり =====
```

### **ステップ 2: トークンを用意**

再開時までに、以下を取得してください：

| 項目 | 取得先 |
|------|--------|
| GitHub Token | https://github.com/settings/tokens |
| Vercel Token | https://vercel.com/account/tokens |
| Vercel Project ID | https://vercel.com/dashboard |
| Vercel Org ID | https://vercel.com/account/settings |

### **ステップ 3: Claude Code に上記をペースト**

次回セッション開始時に、上記の「ここからコピー」部分をそのまま Claude Code にペーストしてください。

---

## 📁 再開に必要なファイル

| ファイル | 用途 |
|---------|------|
| `SESSION_RESUME_INSTRUCTIONS.md` | 詳細な再開指示 (Claude Code が読み込む) |
| `auto_deploy.sh` | 自動実行スクリプト |
| `DEPLOYMENT_STATUS.md` | デプロイ状態スナップショット |
| `.env` | 環境変数 (既に設定済み) |

---

## 🎯 再開時の全体フロー

```
1. Claude Code を開く
2. README_RESUME.md を読む (このファイル)
3. テキストをコピーして Claude に送信
4. トークン情報を入力
5. 自動実行スタート
6. デプロイ完了待機 (5-10分)
7. 本番環境で確認
```

---

## ✅ 完了状態

```
✅ コード実装: 15/15 Issues (100%)
✅ ユニットテスト: 5/5 成功
✅ ビルド: 成功 (0 エラー)
✅ Git コミット: 完了
✅ 自動再開スクリプト: 作成済み

⏳ 残り: トークン設定 → GitHub Secrets → デプロイ
```

---

## 🔗 重要なリンク

- **GitHub Secrets**: https://github.com/sholnk/upwork-terminal/settings/secrets/actions
- **GitHub Actions**: https://github.com/sholnk/upwork-terminal/actions
- **Vercel Dashboard**: https://vercel.com/dashboard
- **本番環境**: https://upwork-terminal.vercel.app

---

## 📞 トラブルシューティング

### GitHub 認証エラーが出た場合
→ GitHub Personal Access Token を正しく入力してください

### Vercel デプロイが失敗した場合
→ GitHub Secrets の VERCEL_TOKEN, PROJECT_ID, ORG_ID を確認

### スクリプンが実行できない場合
→ 以下を実行:
```bash
chmod +x /c/Users/SH/dev/wp/upwork-terminal/auto_deploy.sh
bash /c/Users/SH/dev/wp/upwork-terminal/auto_deploy.sh
```

---

## 💡 Tips

- **トークンは絶対に GitHub に commit しないでください** (既に .gitignore に設定済み)
- **GitHub Secrets には UI から手動設定します** (セキュリティのため)
- **デプロイは GitHub Actions が自動で実行します** (Vercel Token が不要になります)

---

**次回セッション開始まで、このファイルを参考にしてください。**

*作成日: 2026-01-08*
