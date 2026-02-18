# スプライトシート分割ツール

スプライトシート画像を指定したタイルサイズで分割するNode.jsスクリプト。

## 概要

このツールは、1枚のスプライトシート画像を個別のタイル画像に分割します。

**主な特徴**
- **柔軟なタイルサイズ**: 任意のタイルサイズを指定可能
- **複数フォーマット対応**: PNG, JPEG, WebP, AVIF
- **再帰的処理**: サブディレクトリも含めて処理可能
- **簡単な出力管理**: 既存ファイルの削除/保持を選択可能

## セットアップ

### 初回のみ

```bash
cd tools/sprite-splitter
npm install
```

## 使い方

### 1. スプライトシートを配置

分割したいスプライトシート画像を以下のディレクトリに配置します：

```
tools/sprite-splitter/original/
```

### 2. 分割実行

```bash
cd tools/sprite-splitter

# 100px×100pxで分割
npm run split:100

# 200px×200pxで分割
npm run split:200

# カスタムサイズで分割
npm run split -- --tileWidth 64 --tileHeight 64
```

### 3. 結果を確認

分割された画像は以下に出力されます：

```
tools/sprite-splitter/out/
└── [スプライト名]/
    ├── [スプライト名]_1.png
    ├── [スプライト名]_2.png
    └── ...
```

## オプション

| オプション | 短縮形 | 説明 | デフォルト |
|-----------|-------|------|-----------|
| `--tileWidth` | `-w` | タイルの横幅（px） | **必須** |
| `--tileHeight` | `-h` | タイルの縦幅（px） | **必須** |
| `--input <dir>` | - | 入力ディレクトリ | `./original` |
| `--output <dir>` | `-o` | 出力ディレクトリ | `./out` |
| `--recursive` | - | サブディレクトリも処理 | `false` |
| `--keep` | - | 既存ファイルを保持 | `false` |
| `--format <fmt>` | - | 出力フォーマット（png/jpeg/webp/avif） | `png` |
| `--quality <num>` | - | 品質（1-100、jpeg/webp/avif用） | `90` |
| `--help` | - | ヘルプを表示 | - |

## 使用例

### 基本的な使い方

```bash
# 32px×32pxのタイルに分割
npm run split -- -w 32 -h 32
```

### WebP形式で出力

```bash
npm run split -- -w 64 -h 64 --format webp --quality 85
```

### サブディレクトリも含めて処理

```bash
npm run split -- -w 48 -h 48 --recursive
```

### 既存ファイルを保持して追加

```bash
npm run split -- -w 100 -h 100 --keep
```

## 対応形式

**入力（スプライトシート）:**
- PNG (.png)
- JPEG (.jpg, .jpeg)
- WebP (.webp)
- AVIF (.avif)

**出力（分割後のタイル）:**
- PNG (デフォルト)
- JPEG
- WebP
- AVIF

## ディレクトリ構造の例

**入力:**
```
tools/sprite-splitter/original/
└── character_sprite.png  (400px × 200px)
```

**実行:**
```bash
npm run split:100  # 100px×100pxで分割
```

**出力:**
```
tools/sprite-splitter/out/
└── character_sprite/
    ├── character_sprite_1.png  (左上)
    ├── character_sprite_2.png
    ├── character_sprite_3.png
    ├── character_sprite_4.png
    ├── character_sprite_5.png  (左下)
    ├── character_sprite_6.png
    ├── character_sprite_7.png
    └── character_sprite_8.png  (右下)
```
※ 4列 × 2行 = 8タイル

## 注意事項

### スプライトシートのサイズについて

スプライトシートのサイズがタイルサイズで割り切れない場合、端の余り領域は無視されます。警告メッセージが表示されますが、処理は続行されます。

例: 410px × 210pxの画像を100px × 100pxで分割
- 実際に分割: 400px × 200px (4列 × 2行)
- 無視される領域: 右端10px、下端10px

### 既存ファイルの扱い

デフォルトでは、同名の出力ディレクトリが既に存在する場合は削除されます。既存ファイルを保持したい場合は `--keep` オプションを使用してください。

## トラブルシューティング

### スプライトシートが見つからない

`tools/sprite-splitter/original/` ディレクトリが存在し、対応形式の画像ファイルが配置されているか確認してください。

### TypeScriptエラー

初回セットアップ時に `npm install` を実行してください。

## ライセンス

プライベート使用
