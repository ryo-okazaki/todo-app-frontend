# ベースイメージ
FROM node:22.15.0-alpine AS base

# 1. Dependencies ステージ
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 依存関係ファイルのコピー
COPY package.json package-lock.json ./
RUN npm ci

# 2. Builder ステージ
FROM base AS builder
WORKDIR /app

# ビルド時引数としてCloudFront URLを受け取る
ARG NEXT_PUBLIC_ASSET_PREFIX
ENV NEXT_PUBLIC_ASSET_PREFIX=${NEXT_PUBLIC_ASSET_PREFIX}

COPY --from=deps /app/node_modules ./node_modules
# プロジェクトファイル全体をコピー
COPY . .

# テレメトリの無効化（任意）
ENV NEXT_TELEMETRY_DISABLED=1

# ビルド実行
RUN npm run build

# 3. Runner ステージ (本番実行用)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# セキュリティのためのユーザー作成
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# curlとwgetのインストール(ヘルスチェック用)
RUN apk add --no-cache curl wget

# 静的ファイルのコピー
# 注意: publicフォルダはルートに配置してください
COPY --from=builder /app/public ./public

# .nextディレクトリの権限設定
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Standaloneビルド成果物のコピー
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
