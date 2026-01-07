# Issue 1.2: プロフィール基本情報同期

## 概要
UpWorkプロフィールの基本情報を取得・表示・編集・同期する。

## 対象フィールド

| UpWorkフィールド | DBフィールド | 型 | 説明 |
|------------------|-------------|-----|------|
| Profile Photo | `User.image` | String | プロフィール画像URL |
| Name | `User.name` | String | 表示名 |
| Title | `UserSettings.title` | String | 職種タイトル（70文字以内） |
| Overview | `UserSettings.overview` | String (Text) | 自己紹介文 |
| Location | `UserSettings.location` | String | 所在地 |
| Timezone | `UserSettings.timezone` | String | タイムゾーン |

## 実装タスク

### 1. スキーマ更新
- [ ] `UserSettings`に`title`, `overview`, `location`フィールド追加
- [ ] マイグレーション実行

### 2. GraphQL API連携
- [ ] `talentProfileByProfileKey` クエリ実装
- [ ] プロフィールデータ取得・パース
- [ ] 更新用Mutation実装

### 3. UI実装
- [ ] プロフィール編集画面作成
- [ ] 各フィールドの入力フォーム
- [ ] 文字数カウンター（Title: 70文字）
- [ ] プレビュー表示

### 4. 同期ロジック
- [ ] UpWork→ローカル同期
- [ ] ローカル→UpWork同期
- [ ] 差分検出・表示

## 受入条件
- [ ] UpWorkから基本情報を取得・表示できる
- [ ] ローカルで編集した内容をUpWorkに反映できる
- [ ] UpWork側の変更を検出・表示できる

## 依存関係
- Issue 1.1: OAuth認証（必須）
