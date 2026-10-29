# 推奨される書き方

## TanStack Start & Cloudflare Workers
- **Server Functions**: サーバー専用の処理や機密情報・バインディング（`cloudflare:workers` や `env`）を扱う際は、必ず `createServerFn` のハンドラ内で行ってください。
- **Import の分離**: クライアント環境（ブラウザ）にビルドされるファイルから `@tanstack/react-start/server` を直接 import しないでください（ビルドエラーや意図しないサーバーモジュールのバンドルを防ぐため）。

## Better Auth & 認証認可
- **執筆者限定ブログ**: ユーザー認証は `ALLOWED_USERS`（デフォルト: `Nlkomaru`）に一致する GitHub ユーザーのみ許可する設定（`user.validateUserInfo` フック）を維持してください。
- **認可ガード**: サーバーサイドの書き込み RPC（記事作成・編集・削除など）では、必ず `requireSession()` および `isAllowedAuthor()` による二重チェックを実施してください。
- **セッションキャッシュ**: サーバーレス環境（Cloudflare Workers）での高速動作のため、Cookie キャッシュ（`session.cookieCache`）を有効にしています。

## コンテンツ管理 & @morinoparty/hagaki
- **コンテンツリポジトリ**: 記事の MDX およびアップロード画像は、ブログ本体ではなくコンテンツ用リポジトリ `Nlkomaru/blog-content`（`content/article/<uuid>/index.mdx`）に保存・コミットします。
- **画像最適化**: 画像は `@jsquash/avif` を用いてクライアント／エディタ側で AVIF 形式に変換し、MDX と同時に 1 つのコミットとして GitHub API 経由でプッシュします。
- **コミッター解決**: Better Auth セッションのユーザー情報から `committerFromBetterAuth` を用いて、正しいコミッター情報（noreply メール等）を付与してください。

## テストと検証
- コード変更後は、以下の 3 つのコマンドがすべて成功することを確認してください:
  1. `pnpm run check:ci` (Biome によるコード整形と静的解析)
  2. `pnpm run build` (TanStack Start のビルドとルートツリー生成)
  3. `pnpm run typecheck` (Cloudflare Workers の型定義生成と TypeScript の型チェック)
