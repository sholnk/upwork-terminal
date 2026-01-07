# Issue 1.4: 時給・稼働設定

## 概要
料金と稼働状況をUpWorkと同期する。

## 対象フィールド

| フィールド | 型 | 説明 |
|-----------|-----|------|
| Hourly Rate | Decimal | 時給（USD） |
| Availability | Enum | 週稼働時間（< 30h / > 30h） |
| Availability Badge | Boolean | 「Available now」バッジ |

## 実装タスク

### 1. UI実装
- [ ] 時給入力（USD、手取り計算表示）
- [ ] 稼働時間選択（ラジオボタン）
- [ ] バッジON/OFF切り替え

### 2. 同期ロジック
- [ ] UpWork→ローカル同期
- [ ] ローカル→UpWork同期

## 受入条件
- [ ] 現在の時給・稼働状況が表示される
- [ ] 編集してUpWorkに反映できる
- [ ] バッジのON/OFFが切り替えられる

## 依存関係
- Issue 1.1: OAuth認証
