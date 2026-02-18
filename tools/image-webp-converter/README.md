# WebP Converter Tool

`tools/image-webp-converter/origin` ディレクトリ内の画像（JPG/PNG/JPEG）をWebP形式に一括変換し、`tools/image-webp-converter/out` ディレクトリに出力するツールです。

## 概要

WebP は Google が開発した次世代画像フォーマットで、JPG や PNG と比較して優れた圧縮率を実現します。このツールを使用することで、既存の画像を WebP に一括変換し、Web サイトのパフォーマンスを向上させることができます。

### 主な特徴

- **一括変換**: ディレクトリ内の全ての JPG/PNG 画像を一度に変換
- **ディレクトリ構造の維持**: `origin` 以下のサブディレクトリ構造を `out` 内でも維持
- **品質調整**: 変換時の品質を 1-100 の範囲で指定可能
- **上書き制御**: 既存ファイルのスキップまたは上書きを選択可能
- **詳細なログ**: 各ファイルの変換結果とファイルサイズの削減量を表示

## セットアップ

```bash
cd tools/image-webp-converter
npm install
```

## 使い方

### 基本的な使い方

1. `origin` ディレクトリに変換したい画像を配置します（サブディレクトリも可）。
2. 以下のコマンドを実行します。

```bash
npm run convert
```

### 品質を指定する場合

品質パラメータは 1-100 の範囲で指定できます。数値が大きいほど高品質ですが、ファイルサイズも大きくなります。

```bash
# 品質 90 で変換（高品質）
npm run convert -- --quality 90

# 品質 60 で変換（高圧縮）
npm run convert -- --quality 60
```

**推奨品質設定:**
- **写真**: 80-90（デフォルト: 80）
- **イラスト・アイコン**: 70-85
- **サムネイル**: 60-75

### 既存ファイルを上書きする場合

デフォルトでは、`out` ディレクトリに同名の WebP ファイルが既に存在する場合はスキップされます。強制的に上書きする場合は `--overwrite` オプションを使用します。

```bash
npm run convert -- --overwrite
```

### オプションの組み合わせ

```bash
npm run convert -- --quality 85 --overwrite
```

## ディレクトリ構成

```
tools/image-webp-converter/
├── origin/              # 入力画像を配置するディレクトリ
│   ├── image1.jpg
│   ├── image2.png
│   └── subdir/
│       └── image3.jpg
├── out/                 # 変換されたWebP画像が出力されるディレクトリ
│   ├── image1.webp
│   ├── image2.webp
│   └── subdir/
│       └── image3.webp
├── webpConverter.ts     # メインスクリプト
├── package.json
└── README.md
```

## オプション一覧

| オプション | 説明 | デフォルト |
|-----------|------|-----------|
| `--quality <number>` | WebPの品質（1-100） | 80 |
| `--overwrite` | 既存のWebPファイルを上書き | false（スキップ） |
| `--help`, `-h` | ヘルプを表示 | - |

## 対応フォーマット

### 入力形式
- JPG / JPEG
- PNG

### 出力形式
- WebP

## 技術仕様

- **使用ライブラリ**: [Sharp](https://sharp.pixelplumbing.com/) - 高速な画像処理ライブラリ
- **実行環境**: Node.js (ES Modules)
- **TypeScript**: 型安全な実装

## 注意事項

- `origin` ディレクトリ内の元画像は削除されません。
- 変換後のファイル名は元のファイル名から拡張子のみが `.webp` に変更されます。
- 既に WebP 形式の画像は処理対象外です。

## トラブルシューティング

### `origin` ディレクトリが見つからない

```
Error: 入力ディレクトリが見つかりません
```

→ `tools/image-webp-converter/origin` ディレクトリを作成し、画像を配置してください。

### 変換対象の画像が見つからない

```
変換対象の画像ファイルが見つかりませんでした。
```

→ `origin` ディレクトリに JPG または PNG 形式の画像が配置されているか確認してください。
