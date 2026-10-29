# Version Control

- ブランチを切る際は、`main` ブランチから切り、プルリクエストは必ず `main` ブランチに対して行うこと。
- ブランチを切ってから作業を始める前に、`main` ブランチの最新の状態を取り込んで作業をすること。
- 別の作業があったとしても、できるだけすべてのファイルをステージングの対象とすること。

## 作業完了後の流れ

- 作業が終わったら、以下を続けて行うこと:
  1. `pnpm run check:ci` (Biome) でリント・フォーマットを確認する
  2. `pnpm run build` でビルドが通ることを確認する
  3. `pnpm run typecheck` で TypeScript の型チェックが通ることを確認する
  4. すべての変更をコミットする
  5. ブランチを push する
  6. 必要に応じて `gh pr create` で main ブランチに対してプルリクエストを作成する
- プルリクエストのタイトルはコミットメッセージと同じ形式（emoji + 英語の概要）で書くこと。
- プルリクエストの本文は英語または日本語で、変更内容と背景を簡潔に書くこと。
- 作業が途中で止まった場合や、ユーザーが明示的に「push しない」「PR を作らない」と言った場合はこの限りではない。

## Repositories
- アプリケーション本体: [Nlkomaru/blog.nikomaru.dev](https://github.com/Nlkomaru/blog.nikomaru.dev)
- コンテンツ管理: [Nlkomaru/blog-content](https://github.com/Nlkomaru/blog-content)

## コミットメッセージ
- コミットメッセージは英語で書き、以下のような形式で書く。

```
emoji コミットの概要
```

例:
```
✨ Add new post editor feature
🐛 Fix session check in author guard
🔧 Update Cloudflare Workers deployment config
🎨 Polish blog post layout with shadcn
```

## GitHub Secrets の命名規則
- GitHub Actions の仕様上、シークレット名を `GITHUB_` から始めることはできません（HTTP 422 エラーとなります）。
- OAuth 認証情報などのシークレットは `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` のように命名してください。

## Issueについて
- 新しい機能を追加する場合は、Issueを作成してください。
- Issueは英語で書き、適切なラベルを追加してください。
- 現状存在しないラベルについては、勝手に作成しないでください。
