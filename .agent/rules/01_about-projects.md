## このアプリケーションの概要
「blog.nikomaru.dev」は、Nlkomaru による技術ブログ・開発ログです。
フロントエンドリポジトリ名は `Nlkomaru/blog.nikomaru.dev` です。

## 目的
`@morinoparty/hagaki` をコアエンジンとし、TanStack Start + Cloudflare Workers 上で高速に動作するブログを提供します。

- **閲覧**: 誰でも記事一覧、検索、カテゴリ絞り込み、記事詳細を閲覧できます。
- **執筆・管理**: Better Auth + GitHub OAuth を利用し、許可された執筆者（`Nlkomaru`）のみが記事の新規作成・編集・カテゴリ管理を行えます。
- **コンテンツ管理**: 記事の本文（MDX）および画像（AVIF）は GitHub 上のコンテンツリポジトリ `Nlkomaru/blog-content` に直接コミット・保管されます。

## ドメイン
- 本番カスタムドメイン: `https://blog.nikomaru.dev`
- Cloudflare Workers ドメイン: `https://blog-nikomaru-dev.nikomaru.workers.dev`

## 主な技術スタック
- **言語**: TypeScript (Node.js 26)
- **パッケージマネージャ**: pnpm
- **フレームワーク**: TanStack Start (Vite + Cloudflare Workers)
- **ルーティング**: TanStack Router (ファイルベースルーティング)
- **状態管理 / データフェッチ**: TanStack Query
- **コンテンツエンジン**: `@morinoparty/hagaki` (MDX、MDXEditor、画像変換)
- **認証**: Better Auth (Cookieキャッシュ、GitHub OAuth)
- **UI / スタイル**: Tailwind CSS v4, shadcn/ui, Radix UI, Lucide React
- **画像最適化**: `@jsquash/avif`
- **Linter / Formatter**: Biome
- **ホスティング**: Cloudflare Workers (CI/CD: GitHub Actions)

## モジュール・リポジトリ構成
- `Nlkomaru/blog.nikomaru.dev` - ブログ本体（フロントエンド & SSR Worker）
- `Nlkomaru/blog-content` - 記事・画像・カテゴリデータ管理用リポジトリ
