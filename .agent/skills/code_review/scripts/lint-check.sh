#!/bin/bash
# lint-check.sh
# ESLint と TypeScript のエラーを自動チェックするスクリプト
# 使用方法: ./lint-check.sh [対象ディレクトリ]

set -e

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 対象ディレクトリ（引数がなければカレントディレクトリ）
TARGET_DIR="${1:-.}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   コードレビュー自動チェック開始${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# エラーカウンター
TOTAL_ERRORS=0

# ---------------------------------------------
# 1. TypeScript 型チェック
# ---------------------------------------------
echo -e "${YELLOW}[1/3] TypeScript 型チェック実行中...${NC}"

if command -v pnpm &> /dev/null; then
  PKG_MANAGER="pnpm"
elif command -v npm &> /dev/null; then
  PKG_MANAGER="npm"
else
  echo -e "${RED}エラー: pnpm または npm が見つかりません${NC}"
  exit 1
fi

if $PKG_MANAGER run type-check 2>/dev/null; then
  echo -e "${GREEN}✓ TypeScript 型チェック: 問題なし${NC}"
else
  echo -e "${RED}✗ TypeScript 型チェック: エラーあり${NC}"
  TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
fi
echo ""

# ---------------------------------------------
# 2. ESLint チェック
# ---------------------------------------------
echo -e "${YELLOW}[2/3] ESLint チェック実行中...${NC}"

if $PKG_MANAGER run lint 2>/dev/null; then
  echo -e "${GREEN}✓ ESLint: 問題なし${NC}"
else
  echo -e "${RED}✗ ESLint: エラーあり${NC}"
  TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
fi
echo ""

# ---------------------------------------------
# 3. any 型の使用チェック
# ---------------------------------------------
echo -e "${YELLOW}[3/3] 'any' 型の使用をチェック中...${NC}"

ANY_COUNT=$(grep -r ": any" --include="*.ts" --include="*.tsx" "$TARGET_DIR" 2>/dev/null | grep -v "node_modules" | grep -v ".d.ts" | wc -l | tr -d ' ')

if [ "$ANY_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}⚠ 'any' 型が ${ANY_COUNT} 箇所で使用されています:${NC}"
  grep -rn ": any" --include="*.ts" --include="*.tsx" "$TARGET_DIR" 2>/dev/null | grep -v "node_modules" | grep -v ".d.ts" | head -10
  if [ "$ANY_COUNT" -gt 10 ]; then
    echo -e "${YELLOW}  ... 他 $((ANY_COUNT - 10)) 箇所${NC}"
  fi
else
  echo -e "${GREEN}✓ 'any' 型: 使用なし${NC}"
fi
echo ""

# ---------------------------------------------
# サマリー出力
# ---------------------------------------------
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   チェック結果サマリー${NC}"
echo -e "${BLUE}========================================${NC}"

if [ "$TOTAL_ERRORS" -eq 0 ]; then
  echo -e "${GREEN}✓ 全てのチェックに合格しました！${NC}"
  exit 0
else
  echo -e "${RED}✗ ${TOTAL_ERRORS} 件のエラーが見つかりました${NC}"
  echo -e "${YELLOW}修正後、再度チェックを実行してください${NC}"
  exit 1
fi
