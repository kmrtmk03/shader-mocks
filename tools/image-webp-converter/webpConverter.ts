/**
 * WebP変換ツール
 * 
 * tools/image-webp-converter/origin ディレクトリ内の画像ファイル（JPG/PNG）を再帰的に探索し、
 * WebP形式に変換して tools/image-webp-converter/out ディレクトリに出力するツール。
 * origin 以下のディレクトリ構造は out 内でも維持されます。
 * 
 * 主な機能:
 * - ディレクトリの再帰的探索
 * - JPG/PNG/JPEG の検出と変換
 * - 変換品質の指定
 * - 上書き保存の制御
 * - ディレクトリ構造の維持
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readdir, stat, access } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import sharp from 'sharp';

// ESモジュールで__dirnameを使用するための設定
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// デフォルトの入出力ディレクトリ
const DEFAULT_INPUT_DIR = path.join(__dirname, 'origin');
const DEFAULT_OUTPUT_DIR = path.join(__dirname, 'out');

/**
 * コマンドラインオプションの型定義
 */
type CliOptions = {
  inputDir: string;       // 入力ディレクトリパス
  outputDir: string;      // 出力ディレクトリパス
  quality: number;        // WebPの品質（1-100）
  overwrite: boolean;     // 既存のWebPファイルを上書きするかどうか
};

// 対応している入力画像形式の拡張子
const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

// デフォルトの変換品質
const DEFAULT_QUALITY = 80;

/**
 * ヘルプメッセージを表示する関数
 */
function printHelp(): void {
  console.log(`
Usage: npm run convert [options]

Options:
  --quality <1-100>     WebPの品質 (default: ${DEFAULT_QUALITY})
  --overwrite           既存のWebPファイルを上書きする (default: false)
  --help, -h            ヘルプを表示

Directories:
  Input:  ./origin
  Output: ./out
`);
}

/**
 * コマンドライン引数をパースする関数
 * 
 * @param argv - プロセス引数（process.argv.slice(2)）
 * @returns パースされたオプション
 */
function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    inputDir: DEFAULT_INPUT_DIR,
    outputDir: DEFAULT_OUTPUT_DIR,
    quality: DEFAULT_QUALITY,
    overwrite: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--quality') {
      if (i + 1 < argv.length) {
        const q = parseInt(argv[i + 1], 10);
        if (isNaN(q) || q < 1 || q > 100) {
          throw new Error('--quality は 1 から 100 の数値を指定してください');
        }
        options.quality = q;
        i++;
      } else {
        throw new Error('--quality オプションには数値を指定してください');
      }
    } else if (arg === '--overwrite') {
      options.overwrite = true;
    }
  }

  return options;
}

/**
 * ファイルエントリの型
 */
type FileEntry = {
  absPath: string;  // 絶対パス
  relPath: string;  // inputDir からの相対パス
};

/**
 * ディレクトリを再帰的に探索して画像ファイルを収集する関数
 * 
 * @param dir - 現在探索中のディレクトリ（絶対パス）
 * @param baseDir - 探索開始ディレクトリ（絶対パス）
 * @returns 画像ファイルのリスト
 */
async function collectImageFiles(dir: string, baseDir: string): Promise<FileEntry[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: FileEntry[] = [];

  for (const entry of entries) {
    const absPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // ディレクトリの場合は再帰的に探索
      files.push(...(await collectImageFiles(absPath, baseDir)));
    } else {
      // ファイルの場合は拡張子をチェック
      const ext = path.extname(entry.name).toLowerCase();
      if (SUPPORTED_EXTENSIONS.has(ext)) {
        files.push({
          absPath,
          relPath: path.relative(baseDir, absPath),
        });
      }
    }
  }

  return files;
}

/**
 * 画像をWebPに変換する関数
 * 
 * @param file - 処理対象のファイル
 * @param options - CLIオプション
 * @returns 変換結果（成功時は削減サイズ、スキップ時はnull）
 */
async function convertToWebp(file: FileEntry, options: CliOptions): Promise<{ savedBytes: number } | null> {
  const { absPath, relPath } = file;

  // 出力パスの構築: outputDir + 相対パス（拡張子変更）
  const relDir = path.dirname(relPath);
  const ext = path.extname(absPath);
  const basename = path.basename(absPath, ext);
  const outputDir = path.join(options.outputDir, relDir);
  const outputPath = path.join(outputDir, `${basename}.webp`);

  // 出力先ディレクトリの作成
  await mkdir(outputDir, { recursive: true });

  // 既存ファイルのチェック
  try {
    await access(outputPath);
    // ファイルが存在する場合
    if (!options.overwrite) {
      console.log(`  ⏭️  Skip (exists): ${relPath} -> ${path.relative(options.outputDir, outputPath)}`);
      return null;
    }
  } catch {
    // ファイルが存在しない場合は続行
  }

  try {
    const inputStats = await stat(absPath);

    // Sharpで変換
    await sharp(absPath)
      .webp({ quality: options.quality })
      .toFile(outputPath);

    const outputStats = await stat(outputPath);
    const savedBytes = Math.max(0, inputStats.size - outputStats.size);

    console.log(`  ✅ Converted: ${relPath} -> ${path.relative(options.outputDir, outputPath)} (${formatBytes(inputStats.size)} -> ${formatBytes(outputStats.size)})`);

    return { savedBytes };
  } catch (error) {
    console.error(`  ❌ Error converting ${relPath}:`, error);
    throw error;
  }
}

/**
 * バイト数を人間が読みやすい形式にフォーマット
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

/**
 * メイン処理
 */
async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));

    console.log(`
WebP Conversion Tool
--------------------
Input:     ${options.inputDir}
Output:    ${options.outputDir}
Quality:   ${options.quality}
Overwrite: ${options.overwrite}
--------------------
`);

    // 入力ディレクトリの存在確認
    try {
      const stats = await stat(options.inputDir);
      if (!stats.isDirectory()) {
        throw new Error(`入力ディレクトリが存在しません: ${options.inputDir}`);
      }
    } catch (error) {
      // ディレクトリ自体がない場合もここに来る
      throw new Error(`入力ディレクトリが見つかりません: ${options.inputDir}\norigin ディレクトリを作成し、画像を配置してください。`);
    }

    const start = performance.now();

    // 画像ファイルの収集
    console.log('Searching for images...');
    const files = await collectImageFiles(options.inputDir, options.inputDir);

    if (files.length === 0) {
      console.log('変換対象の画像ファイルが見つかりませんでした。');
      return;
    }

    console.log(`${files.length} 個の画像ファイルが見つかりました。変換を開始します...\n`);

    let processedCount = 0;
    let skippedCount = 0;
    let totalSavedBytes = 0;

    // 順次変換処理
    for (const file of files) {
      try {
        const result = await convertToWebp(file, options);
        if (result) {
          processedCount++;
          totalSavedBytes += result.savedBytes;
        } else {
          skippedCount++;
        }
      } catch (error) {
        // 個別のファイルエラーはログに出して続行
      }
    }

    const duration = (performance.now() - start) / 1000;

    console.log(`
--------------------
Conversion Complete!
--------------------
Processed: ${processedCount} files
Skipped:   ${skippedCount} files
Time:      ${duration.toFixed(2)}s
Saved:     ${formatBytes(totalSavedBytes)}
`);

  } catch (error) {
    console.error('\nError:', (error as Error).message);
    process.exit(1);
  }
}

main();
