# CLAUDE.md

このファイルは、このリポジトリで Claude Code が作業するときのガイダンスを提供します。

## プロジェクト概要

**Amazon Services Widgets** は、Amazon のホームページにウィジェットを挿入する Chrome 拡張機能です。ユーザーが選択したサービスウィジェット（Amazon Photos、Kindle Unlimited など）をナビゲーションバーの上に表示し、素早くアクセスできるようにします。

- **マニフェスト**: Manifest V3
- **対応ドメイン**: `amazon.co.jp` と `amazon.com`
- **拡張機能バージョン**: 1.7

## アーキテクチャ

### ファイル構成

```
.
├── manifest.json          # 拡張機能の定義（権限、スクリプト挿入位置）
├── content.js             # Amazon ページにウィジェットを挿入する
├── content.css            # ウィジェットのスタイル定義
├── options/
│   ├── options.html       # ユーザー設定ページの UI
│   └── options.js         # 設定の保存・読み込みロジック
└── README.md
```

### データフロー

1. **コンテントスクリプト実行** (`content.js`):
   - Amazon ページ読み込み時に `document_end` で実行
   - `chrome.storage.sync` から有効なウィジェット種別を読み込む
   - DOM を探索してナビゲーション要素を特定
   - ウィジェットコンテナを作成し、設定に応じたウィジェットを挿入

2. **ウィジェット設定** (`options/options.html` + `options/options.js`):
   - ユーザーがチェックボックスで表示するウィジェットを選択
   - `chrome.storage.sync` に保存（デバイス間で同期）
   - Amazon ページを再読み込みするとコンテントスクリプトが最新設定を反映

### 重要な実装詳細

- **ウィジェット定義**: `content.js` の `widgetConfigs` オブジェクトで管理
  - `photos`, `kindle`, `manage_kindle`, `prime_video` の 4 種類が定義済み
  - 新しいウィジェットを追加するには `widgetConfigs` に追加後、`options.html` にチェックボックスを追加

- **DOM 挿入ポイント**: `#navbar-main`, `#nav-main`, `#nav-belt`, `#nav-belt` の優先順で検索
  - 見つからない場合は `<header>` を使用
  - ウィジェットコンテナはナビゲーション要素の直後（`nextSibling`）に挿入

- **ドメイン検出**: `location.hostname` で `amazon.com` か `amazon.co.jp` かを判定し、ウィジェット URL を構築

- **スタイリング**: `content.css` で一括管理
  - コンテナ: flexbox で中央配置、背景色 `#e3e6e6`
  - ウィジェット: 背景 `#232f3e`、枠線 `#0073bb`、テキスト白

## 開発ガイドライン

### ウィジェットの追加

1. `content.js` の `widgetConfigs` に新しいエントリを追加
   ```javascript
   myservice: {
     elements: [
       { tag: 'a', text: 'My Service', url: 'https://www.amazon.co.jp/...' }
     ]
   }
   ```

2. `options/options.html` にチェックボックスを追加
   ```html
   <label><input type="checkbox" value="myservice"> My Service</label><br>
   ```

3. `content.js` の `defaultWidgetTypes` 配列に追加（オプション）

### スタイルの変更

- `content.css` で `#amazon-widgets-container` と `.amazon-widget`、`.amazon-widget-link` のスタイルを調整
- インラインスタイルは最小限に留める

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
- **ウィジェット URL が間違っている**: `createWidgetConfigs` の `baseUrl` 構築ロジックを確認
- **オプションページが保存されない**: `chrome.storage.sync.set()` の権限が有効か確認（`manifest.json` の `storage` 権限）

## 既知の問題

詳細は `REVIEW.md` を参照。主な点：

- ウィジェット URL が `amazon.co.jp` にのみ対応（`amazon.com` ユーザーは多言語対応が必要）
- 新規インストール時にウィジェットが表示されない（デフォルト設定が空の場合）
- オプションページのラベル表記がウィジェットのラベルと異なる可能性がある

## Chrome API 使用箇所

- `chrome.storage.sync`: ユーザー設定の永続化・同期
- `chrome.scripting`: コンテントスクリプトの挿入（manifest.json で宣言的に指定）
