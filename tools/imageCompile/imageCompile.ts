/**
 * 画像圧縮ツール
 * 
 * tools/imageCompile/origin ディレクトリ内の画像を圧縮し、
 * tools/imageCompile/out に出力するNode.jsスクリプト。
 * Sharpライブラリを使用して高品質な画像圧縮を実現。
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readdir, stat } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import sharp from 'sharp';
import { execa } from 'execa';
import pngquantPath from 'pngquant-bin';

/**
 * ファイル情報を保持する型
 */
type FileEntry = {
  absPath: string;  // 絶対パス
  relPath: string;  // origin ディレクトリからの相対パス
};

/**
 * コマンドラインオプションの型
 */
type CliOptions = {
  quality: number;        // 圧縮品質（1-100）
  maxWidth?: number;      // リサイズ時の最大幅（オプション）
  maxHeight?: number;     // リサイズ時の最大高さ（オプション）
};

// 対応している画像形式の拡張子
const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

// デフォルトの圧縮品質（1-100の範囲）
const DEFAULT_QUALITY = 70;

// ESモジュールで__dirnameを使用するための設定
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 入出力ディレクトリ
const INPUT_DIR = path.join(__dirname, 'origin');
const OUTPUT_DIR = path.join(__dirname, 'out');

// Sharpのキャッシュを無効化（メモリ使用量を抑制）
sharp.cache(false);

/**
 * ヘルプメッセージを表示する関数
 * 
 * コマンドラインで --help または -h が指定された場合に呼び出される。
 * 使用方法とオプションの説明を出力する。
 */
function printHelp(): void {
  console.log(`Usage: npm run compress [-- --quality 80 --max-width 1920 --max-height 1080]\n\nOptions:\n  --quality <1-100>     JPEG/PNG/WEBP/AVIF quality (default: ${DEFAULT_QUALITY})\n  --max-width <px>      Optional resize width (maintains aspect ratio)\n  --max-height <px>     Optional resize height (maintains aspect ratio)\n\nDirectories:\n  Input:  tools/imageCompile/origin\n  Output: tools/imageCompile/out`);
}

/**
 * 文字列を正の数値にパースする関数
 * 
 * @param value - パース対象の文字列
 * @param label - エラーメッセージ用のラベル（例: '--quality'）
 * @returns パースされた数値
 * @throws 値が未定義、数値でない、または0以下の場合にエラー
 */
function parseNumber(value: string | undefined, label: string): number {
  if (!value) {
    throw new Error(`${label} の値が設定されていません`);
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`${label} は正の数値で指定してください`);
  }
  return parsed;
}

/**
 * コマンドライン引数をパースしてオプションオブジェクトを生成する関数
 * 
 * 対応するフラグ:
 * - --quality: 圧縮品質（1-100の範囲に自動調整）
 * - --max-width: リサイズ時の最大幅
 * - --max-height: リサイズ時の最大高さ
 * - --help / -h: ヘルプ表示
 * 
 * @param argv - コマンドライン引数の配列
 * @returns パースされたオプション
 * @throws 不明なフラグや不正な値が指定された場合にエラー
 */
function parseArgs(argv: string[]): CliOptions {
  // デフォルト値で初期化
  const options: CliOptions = {
    quality: DEFAULT_QUALITY,
  };

  // 引数を順番に処理
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    // ヘルプフラグの場合は表示して終了
    if (token === '--help' || token === '-h') {
      printHelp();
      process.exit(0);
    }

    // フラグでない場合はスキップ
    if (!token.startsWith('--')) {
      continue;
    }

    // --flag=value 形式または --flag value 形式をパース
    const [flag, inline] = token.split('=');
    let value = inline;
    if (!value && i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
      value = argv[i + 1];
      i += 1;
    }

    // フラグに応じた処理
    switch (flag) {
      case '--quality': {
        const numericQuality = parseNumber(value, '--quality');
        // 品質を1-100の範囲に制限
        options.quality = Math.max(1, Math.min(100, Math.round(numericQuality)));
        break;
      }
      case '--max-width':
        options.maxWidth = Math.round(parseNumber(value, '--max-width'));
        break;
      case '--max-height':
        options.maxHeight = Math.round(parseNumber(value, '--max-height'));
        break;
      default:
        throw new Error(`不明なフラグです: ${flag}`);
    }
  }

  return options;
}

/**
 * 圧縮元ディレクトリの存在を確認する関数
 * 
 * tools/imageCompile/origin ディレクトリが存在するかチェックする。
 * 存在しない場合はエラー。
 * 
 * @returns 存在するソースディレクトリのパス
 * @throws ディレクトリが存在しない場合にエラー
 */
async function checkSourceDir(): Promise<string> {
  try {
    const stats = await stat(INPUT_DIR);
    if (stats.isDirectory()) {
      return INPUT_DIR;
    }
  } catch {
    // 存在しない場合はエラー
  }

  throw new Error('tools/imageCompile/origin が存在しません。画像を配置してください。');
}

/**
 * 指定ディレクトリ内の画像ファイルを再帰的に収集する関数
 * 
 * サブディレクトリも含めて全ての画像ファイルを検索し、
 * 対応形式（.jpg, .jpeg, .png, .webp, .avif）のファイルのみを収集する。
 * 
 * @param dir - 検索対象のディレクトリ（絶対パス）
 * @param relativeBase - 相対パスのベース（再帰呼び出し用）
 * @returns 画像ファイルの情報配列
 */
async function collectImageFiles(dir: string, relativeBase = ''): Promise<FileEntry[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: FileEntry[] = [];

  // 全てのエントリを並列処理
  await Promise.all(
    entries.map(async (entry) => {
      const relPath = relativeBase ? path.join(relativeBase, entry.name) : entry.name;
      const absPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // ディレクトリの場合は再帰的に検索
        files.push(...(await collectImageFiles(absPath, relPath)));
      } else {
        // ファイルの場合は拡張子をチェック
        const ext = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_EXTENSIONS.has(ext)) {
          files.push({ absPath, relPath });
        }
      }
    }),
  );

  return files;
}

/**
 * pngquantを使用してPNG画像をさらに圧縮する関数
 * 
 * SharpでリサイズとEXIF処理を行った後、pngquantで高度な色数削減を実施。
 * TinyPNGと同等の圧縮品質を実現。
 * 
 * @param inputPath - 入力ファイルパス
 * @param outputPath - 出力ファイルパス
 * @param quality - 圧縮品質（1-100）
 */
async function compressWithPngquant(
  inputPath: string,
  outputPath: string,
  quality: number
): Promise<void> {
  // 品質を0-100から0-100の範囲にマッピング（pngquantは0-100の範囲）
  const minQuality = Math.max(0, quality - 10);
  const maxQuality = quality;

  try {
    await execa(pngquantPath, [
      '--quality', `${minQuality}-${maxQuality}`,
      '--speed', '1',  // 最高品質（最も遅い）
      '--strip',       // メタデータを削除
      '--force',       // 既存ファイルを上書き
      '--output', outputPath,
      inputPath,
    ]);
  } catch (error) {
    // pngquantが失敗した場合は元のファイルをそのまま使用
    console.warn(`  pngquant failed for ${inputPath}, using Sharp output`);
  }
}

/**
 * 画像ファイルを圧縮する関数
 * 
 * 処理の流れ:
 * 1. EXIF情報に基づいて画像を回転
 * 2. 必要に応じてリサイズ（アスペクト比保持）
 * 3. 画像形式に応じた最適な圧縮設定を適用
 * 4. 圧縮後のファイルを出力
 * 
 * @param file - 圧縮対象のファイル情報
 * @param options - 圧縮オプション
 * @param outputDir - 出力先ディレクトリ
 * @returns 圧縮前後のサイズと出力パス、または処理失敗時はnull
 */
async function compressImage(
  file: FileEntry,
  options: CliOptions,
  outputDir: string
): Promise<{ before: number; after: number; outputPath: string } | null> {
  const { absPath, relPath } = file;
  const outputPath = path.join(outputDir, relPath);

  // 出力先ディレクトリを作成（存在しない場合）
  await mkdir(path.dirname(outputPath), { recursive: true });

  // 圧縮前のファイルサイズを取得
  const inputStats = await stat(absPath);

  // Sharpパイプラインを初期化（EXIF情報に基づいて自動回転）
  let pipeline = sharp(absPath).rotate();

  // リサイズオプションが指定されている場合
  if (options.maxWidth || options.maxHeight) {
    pipeline = pipeline.resize({
      width: options.maxWidth,
      height: options.maxHeight,
      fit: 'inside',              // アスペクト比を保持したまま指定サイズ内に収める
      withoutEnlargement: true,   // 元画像より大きくしない
    });
  }

  const ext = path.extname(relPath).toLowerCase();

  // 画像形式に応じた圧縮設定を適用
  switch (ext) {
    case '.png': {
      // PNG: まずSharpで基本処理、その後pngquantで高度な圧縮
      const tempPath = `${outputPath}.temp.png`;

      pipeline = pipeline.png({
        compressionLevel: 9,
        quality: 100,  // pngquantで圧縮するため、ここでは品質を落とさない
      });

      // 一時ファイルに出力
      await pipeline.toFile(tempPath);

      // pngquantでさらに圧縮
      await compressWithPngquant(tempPath, outputPath, options.quality);

      // 一時ファイルを削除
      try {
        await stat(tempPath);
        const { unlink } = await import('node:fs/promises');
        await unlink(tempPath);
      } catch {
        // 一時ファイルが既に削除されている場合は無視
      }

      // 圧縮後のファイルサイズを取得して返す
      const outputStats = await stat(outputPath);
      return { before: inputStats.size, after: outputStats.size, outputPath };
    }
    case '.jpg':
    case '.jpeg':
      // JPEG: MozJPEGエンコーダを使用し、最適化設定を追加
      pipeline = pipeline.jpeg({
        quality: options.quality,
        mozjpeg: true,
        progressive: true,           // プログレッシブJPEG（ファイルサイズ削減）
        optimiseCoding: true,        // ハフマンテーブルの最適化
        trellisQuantisation: true,   // トレリス量子化（品質向上）
      });
      break;
    case '.webp':
      pipeline = pipeline.webp({
        quality: options.quality,
        effort: 6,                   // 圧縮effort（0-6、6が最高品質）
      });
      break;
    case '.avif':
      pipeline = pipeline.avif({
        quality: options.quality,
        effort: 9,                   // 圧縮effort（0-9、9が最高品質）
      });
      break;
    default:
      // 対応していない形式の場合はnullを返す
      return null;
  }

  // 圧縮後の画像をファイルに出力
  await pipeline.toFile(outputPath);

  // 圧縮後のファイルサイズを取得
  const outputStats = await stat(outputPath);

  return { before: inputStats.size, after: outputStats.size, outputPath };
}

/**
 * バイト数を人間が読みやすい形式にフォーマットする関数
 * 
 * 例:
 * - 1024 → "1 KB"
 * - 1536 → "1.5 KB"
 * - 1048576 → "1 MB"
 * 
 * @param bytes - バイト数
 * @returns フォーマットされた文字列（例: "1.5 MB"）
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  // 適切な単位を計算（1024の何乗か）
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  // 10以上の場合は小数点なし、それ以外は小数点2桁
  return `${value.toFixed(value >= 10 ? 0 : 2)} ${units[exponent]}`;
}

/**
 * メイン処理関数
 * 
 * 処理の流れ:
 * 1. 圧縮元ディレクトリの存在確認
 * 2. コマンドライン引数のパース
 * 3. origin ディレクトリの画像を圧縮
 * 4. 処理結果のサマリー表示
 */
async function main(): Promise<void> {
  // 処理時間計測開始
  const start = performance.now();

  // 圧縮元ディレクトリの存在確認
  const inputDir = await checkSourceDir();

  // コマンドライン引数をパース
  const options = parseArgs(process.argv.slice(2));

  // 処理統計用の変数
  let processed = 0;  // 処理成功したファイル数
  let savings = 0;    // 合計削減サイズ（バイト）

  // 出力先ディレクトリを作成
  await mkdir(OUTPUT_DIR, { recursive: true });

  // 圧縮対象の画像ファイルを収集
  const files = await collectImageFiles(inputDir);

  if (files.length === 0) {
    console.log('圧縮対象の画像が見つかりませんでした。');
    return;
  }

  console.log(`\n${files.length}ファイルを処理中...`);

  // 各ファイルを順次圧縮
  for (const file of files) {
    try {
      const result = await compressImage(file, options, OUTPUT_DIR);
      if (!result) {
        continue;
      }
      processed += 1;
      savings += Math.max(0, result.before - result.after);
      // 圧縮結果を表示（元サイズ → 圧縮後サイズ (削減量)）
      console.log(`  ✔ ${file.relPath}: ${formatBytes(result.before)} → ${formatBytes(result.after)} (saved ${formatBytes(Math.max(0, result.before - result.after))})`);
    } catch (error) {
      // エラーが発生した場合は表示して次のファイルへ
      console.error(`  ✖ ${file.relPath}: ${(error as Error).message}`);
    }
  }

  // 処理時間を計算
  const durationMs = performance.now() - start;

  // サマリーを表示
  console.log('\n-----');
  console.log(`処理ファイル数: ${processed}`);
  console.log(`合計削減量: ${formatBytes(savings)}`);
  console.log(`処理時間: ${(durationMs / 1000).toFixed(2)}s`);
}

// メイン処理を実行
// エラーが発生した場合はコンソールに表示し、終了コード1で終了
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
