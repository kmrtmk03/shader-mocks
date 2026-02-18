# 画像処理ツール集

このディレクトリには、画像の最適化・変換・加工を行うための独立したツール群が含まれています。各ツールは独自の `package.json` を持ち、単独で実行可能です。

## 📦 利用可能なツール

### 1. [imageCompile](./imageCompile) - 画像圧縮ツール

高品質かつ高圧縮率な画像最適化を行うツールです。Sharp と pngquant を組み合わせて、TinyPNG に匹敵する圧縮結果を実現します。

**主な機能:**
- PNG/JPEG の高品質圧縮
- pngquant による2段階PNG圧縮
- リサイズ機能（アスペクト比保持）
- ディレクトリ構造の維持

**使い方:**
```bash
cd tools/imageCompile
npm install
npm run compress           # デフォルト品質(70)で圧縮
npm run compress:80        # 品質80で圧縮
npm run compress:90        # 品質90で圧縮
```

**詳細:** [imageCompile/README.md](./imageCompile/README.md)

---

### 2. [image-webp-converter](./image-webp-converter) - WebP変換ツール

JPG/PNG 画像を次世代フォーマットの WebP に一括変換するツールです。Web サイトのパフォーマンス向上に最適です。

**主な機能:**
- JPG/PNG → WebP 一括変換
- 品質調整（1-100）
- 既存ファイルの上書き制御
- ファイルサイズ削減量の表示

**使い方:**
```bash
cd tools/image-webp-converter
npm install
npm run convert                        # デフォルト品質(80)で変換
npm run convert -- --quality 90        # 品質90で変換
npm run convert -- --overwrite         # 既存ファイルを上書き
```

**詳細:** [image-webp-converter/README.md](./image-webp-converter/README.md)

---

### 3. [sprite-splitter](./sprite-splitter) - スプライトシート分割ツール

1枚のスプライトシート画像を指定したタイルサイズで個別の画像に分割するツールです。

**主な機能:**
- 柔軟なタイルサイズ指定
- 複数フォーマット対応（PNG/JPEG/WebP/AVIF）
- サブディレクトリの再帰的処理
- 出力フォーマット・品質の調整

**使い方:**
```bash
cd tools/sprite-splitter
npm install
npm run split:100                      # 100px×100pxで分割
npm run split:200                      # 200px×200pxで分割
npm run split -- -w 64 -h 64          # カスタムサイズで分割
npm run split -- -w 48 -h 48 --format webp --quality 85
```

**詳細:** [sprite-splitter/README.md](./sprite-splitter/README.md)

---

## 🚀 クイックスタート

各ツールは独立して動作するため、使用したいツールのディレクトリに移動して実行します。

### 基本的な流れ

1. **ツールディレクトリに移動**
   ```bash
   cd tools/[ツール名]
   ```

2. **依存関係のインストール（初回のみ）**
   ```bash
   npm install
   ```

3. **入力ディレクトリに画像を配置**
   - `imageCompile`: `origin/` に配置
   - `image-webp-converter`: `origin/` に配置
   - `sprite-splitter`: `original/` に配置

4. **ツールを実行**
   ```bash
   npm run [コマンド]
   ```

5. **出力ディレクトリから結果を取得**
   - すべてのツール: `out/` に出力

---

## 📂 ディレクトリ構造

```
tools/
├── README.md                    # このファイル
├── imageCompile/                # 画像圧縮ツール
│   ├── origin/                  # 入力ディレクトリ
│   ├── out/                     # 出力ディレクトリ
│   ├── imageCompile.ts
│   ├── package.json
│   └── README.md
├── image-webp-converter/        # WebP変換ツール
│   ├── origin/                  # 入力ディレクトリ
│   ├── out/                     # 出力ディレクトリ
│   ├── webpConverter.ts
│   ├── package.json
│   └── README.md
└── sprite-splitter/             # スプライトシート分割ツール
    ├── original/                # 入力ディレクトリ
    ├── out/                     # 出力ディレクトリ
    ├── sprite-splitter.ts
    ├── package.json
    └── README.md
```

---

## 🔧 技術仕様

### 共通仕様

- **実行環境**: Node.js
- **言語**: TypeScript (ES Modules)
- **画像処理**: [Sharp](https://sharp.pixelplumbing.com/)

### ツール別の特殊な依存関係

- **imageCompile**: `pngquant-bin`, `execa` (2段階PNG圧縮用)
- **image-webp-converter**: `sharp` のみ
- **sprite-splitter**: `sharp` のみ

---

## 💡 使用例

### ワークフロー例1: Web用画像の最適化

```bash
# 1. 元画像を圧縮
cd tools/imageCompile
# origin/ に画像を配置
npm run compress:80

# 2. WebP版も作成
cd ../image-webp-converter
# imageCompile/out/ から画像をコピーして origin/ に配置
npm run convert -- --quality 85
```

### ワークフロー例2: スプライトシートの処理

```bash
# 1. スプライトシートを分割
cd tools/sprite-splitter
# original/ にスプライトシートを配置
npm run split:64

# 2. 分割した画像を圧縮
cd ../imageCompile
# sprite-splitter/out/ から画像をコピーして origin/ に配置
npm run compress:90
```

---

## ⚠️ 注意事項

### 入力ファイルの保護

すべてのツールは元の入力ファイルを削除しません。入力ディレクトリ内の画像は常に保持されます。

### ディレクトリ構造の維持

`imageCompile` と `image-webp-converter` は、入力ディレクトリのサブディレクトリ構造を出力ディレクトリでも維持します。

### 独立した実行環境

各ツールは独自の `node_modules` を持ちます。ルートプロジェクトの依存関係とは完全に分離されています。

---

## 🐛 トラブルシューティング

### `npm install` でエラーが発生する

Node.js のバージョンを確認してください。推奨バージョン: Node.js 18 以上

### 入力ディレクトリが見つからない

各ツールの入力ディレクトリ（`origin/` または `original/`）が存在することを確認してください。存在しない場合は手動で作成してください。

### TypeScript のコンパイルエラー

```bash
# ツールディレクトリ内で依存関係を再インストール
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 ライセンス

プライベート使用
