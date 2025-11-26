# CLAUDE.md

このファイルは、このリポジトリで Claude Code が作業するときのガイダンスを提供します。

## プロジェクト概要

**Navado** は、Amazon のホームページにウィジェットを挿入する Chrome 拡張機能です。ユーザーが選択したサービスウィジェット（Amazon Photos、Kindle Unlimited など）をナビゲーションバーの上に表示し、素早くアクセスできるようにします。

- **マニフェスト**: Manifest V3
- **対応ドメイン**: `amazon.co.jp` と `amazon.com`
- **拡張機能バージョン**: 1.7

## アーキテクチャ

### ファイル構成

```
navado/
├── manifest.json              # 拡張機能の定義（権限、スクリプト挿入位置）
├── content.js                 # Amazon ページにウィジェットを挿入する
├── content.css                # ウィジェットのスタイル定義
├── popup.html                 # 拡張機能のポップアップ UI
├── options/
│   ├── options.html           # ユーザー設定ページの UI
│   ├── options.js             # 設定の保存・読み込みロジック
│   └── widgets.json           # ウィジェット定義（マルチ言語対応）
└── README.md
```

### データフロー

1. **コンテントスクリプト実行** (`content.js`):
   - Amazon ページ読み込み時に `document_end` で実行
   - `options/widgets.json` からウィジェット定義を読み込む
   - `chrome.storage.sync` から有効なウィジェット種別を読み込む
   - DOM を探索してナビゲーション要素を特定
   - ウィジェットコンテナを作成し、設定に応じたウィジェットを挿入

2. **ウィジェット設定** (`options/options.html` + `options/options.js`):
   - `options/widgets.json` から利用可能なウィジェット一覧を読み込む
   - ユーザーがチェックボックスで表示するウィジェットを選択
   - `chrome.storage.sync` に保存（デバイス間で同期）
   - Amazon ページを再読み込みするとコンテントスクリプトが最新設定を反映

### 重要な実装詳細

- **ウィジェット定義**: `options/widgets.json` で一元管理
  - 各ウィジェットに `id`、マルチ言語対応の `labels`、ドメイン別の `urls`、デフォルト有効設定 `enabled` を定義
  - `content.js` が JSON を読み込んで動的に設定を生成

- **言語検出**: `detectLanguage()` 関数
  - HTML の `lang` 属性 → ホスト名 → `navigator.language` の優先順で判定
  - `amazon.co.jp` なら日本語（ja）、`amazon.com` なら英語（en）

- **DOM 挿入ポイント**: `findInsertTarget()`
  - `#navbar-main`, `#nav-main`, `#nav-belt`, `#navbar` の優先順で検索
  - 見つからない場合は `<header>` を使用
  - ウィジェットコンテナはナビゲーション要素の直後（`nextSibling`）に挿入

- **ドメイン検出**: `location.hostname` で `amazon.com` か `amazon.co.jp` かを判定
  - widgets.json の `urls.com` または `urls["co.jp"]` を使用

- **スタイリング**: `content.css` で一括管理＋動的なカラー取得
  - コンテナ: flexbox で中央配置
  - ウィジェット: 背景・枠線色は `nav-main` または `nav-belt` から動的に取得（デフォルト: `#232f3e` と `#0073bb`）
  - テキスト白

- **サインイン・サインアップページの除外**: `isSigninPage()`
  - `/ap/signin`, `/ap/register`, `/ap/cvf`, `/ax/` パスを検出して処理をスキップ

## 開発ガイドライン

### ウィジェットの追加

1. `options/widgets.json` に新しいエントリを追加
   ```json
   {
     "id": "myservice",
     "labels": {
       "ja": "マイサービス",
       "en": "My Service"
     },
     "urls": {
       "co.jp": "https://www.amazon.co.jp/...",
       "com": "https://www.amazon.com/..."
     },
     "enabled": true
   }
   ```

2. `options/options.js` でチェックボックスを動的に生成（既に実装済み）

3. Amazon ページをリロードで反映

### スタイルの変更

- `content.css` で `#amazon-widgets-container` と `.amazon-widget`、`.amazon-widget-link` のスタイルを調整
- インラインスタイルはナビゲーションカラーの動的取得のみ

### テスト・動作確認

1. `chrome://extensions/` を開く
2. **デベロッパーモード** をオン
3. **パッケージ化されていない拡張機能を読み込む** から本ディレクトリを選択
4. Amazon ページを開いて、ウィジェットが表示されることを確認
5. 拡張機能メニュー → 詳細 → オプション で設定ページを開く
6. チェックボックスをトグルして **保存** をクリック
7. Amazon ページをリロード（Ctrl+R または Cmd+R）して動作を確認

### よくある修正パターン

- **ウィジェットが表示されない**: `chrome://extensions/` でエラーログを確認。DOM 挿入ポイントが見つからない可能性あり
- **ウィジェット URL が間違っている**: `options/widgets.json` の `urls` フィールドを確認
- **オプションページが保存されない**: `chrome.storage.sync.set()` の権限が有効か確認（`manifest.json` の `storage` 権限）
- **言語が反映されない**: `detectLanguage()` の判定ロジックを確認。HTML `lang` 属性が正確に設定されているか確認

## 既知の問題

- 動的なカラー取得により、テーマ変更時にスタイルが更新されない（ページリロードが必要）

## Chrome API 使用箇所

- `chrome.storage.sync`: ユーザー設定の永続化・同期
- `chrome.runtime.getURL()`: `options/widgets.json` の読み込み
- `fetch()`: JSON ファイルの読み込み
