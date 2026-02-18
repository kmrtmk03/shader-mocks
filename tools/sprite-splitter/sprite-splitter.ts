import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

type OutputFormat = 'png' | 'jpeg' | 'webp' | 'avif';

interface CliOptions {
  tileWidth: number;
  tileHeight: number;
  inputDir: string;
  outputDir: string;
  recursive: boolean;
  keepExisting: boolean;
  format: OutputFormat;
  quality: number;
}

const SUPPORTED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function main() {
  try {
    const options = parseCliOptions(process.argv.slice(2));
    const spriteFiles = await collectSpriteFiles(options.inputDir, options.recursive);

    if (spriteFiles.length === 0) {
      console.log(`分割対象のファイルが見つかりませんでした: ${options.inputDir}`);
      return;
    }

    await fs.mkdir(options.outputDir, { recursive: true });

    for (const spriteFile of spriteFiles) {
      await splitSpriteSheet(spriteFile, options);
    }

    console.log(`\n完了: ${spriteFiles.length} 個のスプライトシートを処理しました。`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

function parseCliOptions(argv: string[]): CliOptions {
  const normalizedArgs = normalizeArgs(argv);
  const defaults: Partial<CliOptions> & Pick<CliOptions, 'inputDir' | 'outputDir' | 'recursive' | 'keepExisting' | 'format' | 'quality'> = {
    inputDir: path.resolve(__dirname, 'original'),
    outputDir: path.resolve(__dirname, 'out'),
    recursive: false,
    keepExisting: false,
    format: 'png' as OutputFormat,
    quality: 90,
  };

  for (let i = 0; i < normalizedArgs.length; i += 1) {
    const arg = normalizedArgs[i];
    switch (arg) {
      case '--tileWidth':
      case '-w':
        defaults.tileWidth = parsePositiveInt(normalizedArgs[++i], 'tileWidth');
        break;
      case '--tileHeight':
      case '-h':
        defaults.tileHeight = parsePositiveInt(normalizedArgs[++i], 'tileHeight');
        break;
      case '--input':
        defaults.inputDir = path.resolve(__dirname, normalizedArgs[++i] ?? '');
        break;
      case '--output':
      case '-o':
        defaults.outputDir = path.resolve(__dirname, normalizedArgs[++i] ?? '');
        break;
      case '--recursive':
        defaults.recursive = true;
        break;
      case '--keep':
        defaults.keepExisting = true;
        break;
      case '--format':
        defaults.format = parseOutputFormat(normalizedArgs[++i]);
        break;
      case '--quality':
        defaults.quality = parsePositiveInt(normalizedArgs[++i], 'quality');
        break;
      case '--help':
      case '-?':
        printUsage();
        process.exit(0);
        break;
      default:
        throw new Error(`未知のオプションです: ${arg}`);
    }
  }

  if (typeof defaults.tileWidth === 'undefined' || typeof defaults.tileHeight === 'undefined') {
    printUsage('tileWidth と tileHeight は必須です。');
    process.exit(1);
  }

  return defaults as CliOptions;
}

async function collectSpriteFiles(baseDir: string, recursive: boolean): Promise<string[]> {
  const result: string[] = [];
  const entries = await fs.readdir(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      if (recursive) {
        result.push(...(await collectSpriteFiles(entryPath, recursive)));
      }
      continue;
    }

    if (SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      result.push(entryPath);
    }
  }

  return result;
}

async function splitSpriteSheet(filePath: string, options: CliOptions) {
  const buffer = await fs.readFile(filePath);
  const sheet = sharp(buffer);
  const metadata = await sheet.metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  if (width === 0 || height === 0) {
    console.warn(`スキップ: 画像サイズを取得できませんでした -> ${filePath}`);
    return;
  }

  const cols = Math.floor(width / options.tileWidth);
  const rows = Math.floor(height / options.tileHeight);

  if (cols === 0 || rows === 0) {
    console.warn(`スキップ: タイルサイズが画像サイズを超えています -> ${filePath}`);
    return;
  }

  if (width % options.tileWidth !== 0 || height % options.tileHeight !== 0) {
    console.warn(`警告: ${path.basename(filePath)} はタイルサイズで割り切れません。端の余り領域は無視されます。`);
  }

  const parsedPath = path.parse(filePath);
  const spriteOutputDir = path.join(options.outputDir, parsedPath.name);

  if (!options.keepExisting) {
    await fs.rm(spriteOutputDir, { recursive: true, force: true });
  }
  await fs.mkdir(spriteOutputDir, { recursive: true });

  const totalTiles = rows * cols;

  console.log(`処理開始: ${parsedPath.base} (${rows}x${cols} = ${totalTiles})`);

  let index = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      index += 1;
      const left = col * options.tileWidth;
      const top = row * options.tileHeight;
      const tileFileName = `${parsedPath.name}_${index}.${options.format}`;
      const tilePath = path.join(spriteOutputDir, tileFileName);

      const region = { left, top, width: options.tileWidth, height: options.tileHeight };
      let pipeline = sharp(buffer).extract(region);
      pipeline = applyFormat(pipeline, options.format, options.quality);
      // Sharp は非破壊なので clone せず buffer から毎回生成しても安全
      await pipeline.toFile(tilePath);
    }
  }

  console.log(`完了: ${spriteOutputDir} に ${totalTiles} 枚出力しました。`);
}

function applyFormat(image: sharp.Sharp, format: OutputFormat, quality: number) {
  switch (format) {
    case 'jpeg':
      return image.jpeg({ quality });
    case 'webp':
      return image.webp({ quality });
    case 'avif':
      return image.avif({ quality });
    default:
      return image.png();
  }
}

function normalizeArgs(argv: string[]): string[] {
  const normalized: string[] = [];
  for (const arg of argv) {
    if (arg.startsWith('--') && arg.includes('=')) {
      const [key, value] = arg.split('=');
      normalized.push(key, value);
    } else {
      normalized.push(arg);
    }
  }
  return normalized;
}

function parsePositiveInt(value: string | undefined, label: string): number {
  if (!value) throw new Error(`${label} の値が指定されていません。`);
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${label} は正の数値で指定してください (現在: ${value})。`);
  }
  return parsed;
}

function parseOutputFormat(value: string | undefined): OutputFormat {
  const format = (value ?? '').toLowerCase();
  if (!['png', 'jpeg', 'webp', 'avif'].includes(format)) {
    throw new Error(`format は png / jpeg / webp / avif のいずれかで指定してください (現在: ${value}).`);
  }
  return format as OutputFormat;
}

function printUsage(message?: string) {
  if (message) {
    console.error(message);
  }
  console.log(`使用方法:
  pnpm tsx tools/sprite-splitter/sprite-splitter.ts --tileWidth <width> --tileHeight <height> [options]

必須:
  --tileWidth, -w     タイルの横幅 (px)
  --tileHeight, -h    タイルの縦幅 (px)

オプション:
  --input <dir>       入力ディレクトリ (デフォルト: ./original)
  --output, -o <dir>  出力ディレクトリ (デフォルト: ./out)
  --recursive         入力ディレクトリを再帰的に探索
  --keep              既存の出力を削除せずに追記
  --format <fmt>      出力フォーマット png/jpeg/webp/avif (デフォルト: png)
  --quality <num>     jpeg/webp/avif の品質 (1-100, デフォルト: 90)
  --help              このヘルプを表示
`);
}

main();
