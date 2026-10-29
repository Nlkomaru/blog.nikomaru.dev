# blog.nikomaru.dev

TanStack Start + Cloudflare Workers + [morinoparty/hagaki](https://github.com/morinoparty/hagaki) によるブログサイト。
コンテンツストレージとして GitHub リポジトリ [`Nlkomaru/blog-content`](https://github.com/Nlkomaru/blog-content) を利用し、認証には Better Auth (GitHub OAuth) を用いて執筆権限を管理します。

## 機能・特徴

- **TanStack Start (Vite + Cloudflare Workers)**: フルスタック SSR と高速なレスポンス
- **shadcn / Tailwind CSS v4**: 洗練されたモダンな UI / モノクロームデザイン
- **morinoparty/hagaki 連携**:
  - GitHub (`Nlkomaru/blog-content`) をストレージとする Headless CMS
  - MDX 記事の読み書き、カテゴリ管理
  - `@mdxeditor/editor` ベースのマークダウンエディタ
  - 画像はブラウザで AVIF にエンコードし、本文と同一コミットで GitHub に保存 (`hagaki/pending-images`)
- **Better Auth + GitHub OAuth ログイン制限**:
  - `ALLOWED_USERS` (既定: `Nlkomaru`) によるアクセス制限
  - 許可されたユーザーのみがサインインおよび記事・カテゴリの作成・編集可能
  - 未認証・非許可ユーザーによる編集 API やルート（`/posts/new`, `/posts/$slug/edit` など）へのアクセスを多層防御でブロック
  - Better Auth のセッションから自動で GitHub コミッター情報 (`Nlkomaru <...@users.noreply.github.com>`) を生成

## ディレクトリ構成

| パス | 内容 |
|---|---|
| `app/routes/` | TanStack Router によるファイルベースルート (`/`, `/posts`, `/posts/$slug`, `/posts/new`, `/posts/$slug/edit`, `/categories`, `/auth/sign-in`, `/api/auth/$`) |
| `app/lib/auth.ts` | Better Auth 設定 (GitHub OAuth, DB-less セッション, ログイン制限フック) |
| `app/lib/auth-server.ts` | サーバーサイドでの執筆権限ガード (`requireSession`) |
| `app/lib/auth-fns.ts` | クライアント / ルーター用セッション取得 RPC (`checkAuthorSessionFn`) |
| `app/lib/hagaki.ts` | hagaki クライアント生成 (`Nlkomaru/blog-content`) |
| `app/lib/committer.ts` | セッションから git コミッター情報を解決 |
| `app/lib/post-editor-server.ts` | 記事保存用の Server Function (本文と AVIF 画像を 1 コミットで GitHub へ) |
| `cloudflare.config.ts` | Worker 設定 (Cloudflare Vite プラグイン) |

## 設定

公開してよい設定は `cloudflare.config.ts` に定義されています:
- `HAGAKI_GITHUB_OWNER`: `"Nlkomaru"`
- `HAGAKI_GITHUB_REPO`: `"blog-content"`
- `HAGAKI_GITHUB_BRANCH`: `"main"`
- `HAGAKI_CDN_BASE_URL`: コンテンツ配信 URL
- `ALLOWED_USERS`: 執筆許可ユーザーの GitHub ユーザー名（カンマ区切りで複数指定可、既定: `"Nlkomaru"`）

### シークレット (Secrets)

| シークレット名 | 内容 |
|---|---|
| `HAGAKI_GITHUB_TOKEN` | `Nlkomaru/blog-content` の Contents (Read and write) 権限を持つ GitHub PAT |
| `AUTH_SECRET` | Better Auth の暗号鍵 (`openssl rand -base64 32`) |
| `GITHUB_CLIENT_ID` | GitHub OAuth App の Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App の Client Secret |

ローカル開発では `.dev.vars` に設定します:
```sh
cp .dev.vars.example .dev.vars
```

> **GitHub OAuth App 設定のコールバック URL:**
> - ローカル開発: `http://localhost:8787/api/auth/callback/github`
> - 本番環境: `https://<your-worker-domain>/api/auth/callback/github`

## ローカル開発

```sh
pnpm install
pnpm run dev        # cf dev (Vite + Cloudflare Workers)
pnpm run check      # biome check
pnpm run typecheck  # cf workers types && tsc
pnpm run build      # cf build (本番ビルド検証)
```

## デプロイ

```sh
# .env に CLOUDFLARE_ACCOUNT_ID と CLOUDFLARE_API_TOKEN を設定
pnpm run deploy
```
