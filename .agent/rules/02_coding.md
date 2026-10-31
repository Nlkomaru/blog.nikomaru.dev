# コーディングプラクティス

## 実装手順

1. **型設計**
   - まず型（TypeScript の interface / type）や Zod / Better Auth スキーマを定義

2. **純粋関数から実装**
   - 外部依存（Cloudflare bindings、GitHub API、DOM）のない純粋関数・ユーティリティを先に実装

## プラクティス

- 小さく始めて段階的に拡張
- 過度な抽象化を避ける
- コードよりも型を重視
- 複雑さに応じてアプローチを調整
- **Client / Server の境界を厳格に保持**:
  - Cloudflare Workers の環境変数・バインディング（`cloudflare:workers`）やサーバー専用パッケージ（`@tanstack/react-start/server`）をクライアント用バンドルに混入させないこと。
  - クライアントから呼び出す処理は TanStack Start の `createServerFn` 経由で行うこと。

## コードスタイル

- 常に既存コードの設計や記法を参考にしてください。
- Biome（`biome.json`）のフォーマットおよびリント規則を遵守してください（タブインデント、ダブルクォート）。
- 書籍「リーダブルコード」のようなベストプラクティスを常に適用してください。
- コードの意図・背景などのコメントを日本語で積極的に入れてください。またエクスポートする関数や型には TSDoc/JSDoc を入れることが推奨されます。
- コンポーネントや関数ごとに適切にファイルを分割してください。
- コードを書いた後は、以下を実行して検証してください:
  1. `pnpm run check:ci` (または `pnpm run check`)
  2. `pnpm run build`
  3. `pnpm run typecheck`
