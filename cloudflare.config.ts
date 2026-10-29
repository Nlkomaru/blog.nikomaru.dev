import { bindings, defineConfig } from "cf/config";

// Account comes from CLOUDFLARE_ACCOUNT_ID (`.env` locally, a GitHub secret
// in CI) — never hard-code it here. Static assets are the Vite client build;
// the Cloudflare Vite plugin wires them up, so no assets setting is needed.
export default defineConfig({
	worker: {
		name: "blog-nikomaru-dev",
		compatibilityDate: "2026-10-01",
		compatibilityFlags: ["nodejs_compat", "global_fetch_strictly_public"],
		entrypoint: "@tanstack/react-start/server-entry",
		// Served at https://blog-nikomaru-dev.<subdomain>.workers.dev and custom domain
		workersDev: true,
		domains: ["blog.nikomaru.dev"],
		previewUrls: true,
		observability: { enabled: true },
		env: {
			// Where `hagaki generate`d content is served
			HAGAKI_CDN_BASE_URL: bindings.text(
				"https://blog-content.moripa.workers.dev",
			),
			HAGAKI_GITHUB_OWNER: bindings.text("Nlkomaru"),
			HAGAKI_GITHUB_REPO: bindings.text("blog-content"),
			HAGAKI_GITHUB_BRANCH: bindings.text("main"),
			HAGAKI_GITHUB_CONTENT_PATH: bindings.text("content/article"),
			// Allowed author(s) GitHub username(s), comma-separated
			ALLOWED_USERS: bindings.text("Nlkomaru"),
			// Worker secrets: `.dev.vars` locally, `cf deploy --secrets-file`
			// (or the dashboard) in production.
			HAGAKI_GITHUB_TOKEN: bindings.secret(),
			AUTH_SECRET: bindings.secret(),
			AUTH_GITHUB_ID: bindings.secret(),
			AUTH_GITHUB_SECRET: bindings.secret(),
			GITHUB_CLIENT_ID: bindings.secret(),
			GITHUB_CLIENT_SECRET: bindings.secret(),
		},
	},
});
