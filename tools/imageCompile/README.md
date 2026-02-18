# Image Compile Tool

`tools/imageCompile/origin` ディレクトリ内の画像を圧縮し、`tools/imageCompile/out` ディレクトリに出力するツールです。
Sharp と pngquant を使用して、高品質かつ高圧縮率な画像最適化を行います。

## 使い方

1. `tools/imageCompile/origin` ディレクトリに圧縮したい画像を配置します（サブディレクトリも可）。
2. 以下のコマンドを実行します。

```bash
# 基本的な使い方
npm run compress

# 品質を指定する場合（デフォルト: 70）
npm run compress:80  # quality 80
npm run compress:90  # quality 90
```

## ディレクトリ構成

- `origin`: 入力画像を配置するディレクトリ
- `out`: 圧縮された画像が出力されるディレクトリ

## オプション

- `--quality <number>`: 圧縮品質（1-100, デフォルト: 70）
- `--max-width <px>`: リサイズ時の最大幅（アスペクト比保持）
- `--max-height <px>`: リサイズ時の最大高さ（アスペクト比保持）
