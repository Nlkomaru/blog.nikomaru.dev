import { env } from "cloudflare:workers";
import { getRequest } from "@tanstack/react-start/server";
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";

// baseURL(= リクエストの origin)ごとに BetterAuth インスタンスをメモ化する。
// 固定の redirect URL を持たないことで、production / preview バージョン /
// ローカル開発のどの origin でもそのまま動く。
const authCache = new Map<string, Promise<Auth>>();

async function buildAuth(baseURL: string) {
	const secret = env.AUTH_SECRET;
	const allowedList = (env.ALLOWED_USERS || "Nlkomaru")
		.split(",")
		.map((u) => u.trim().toLowerCase());

	return betterAuth({
		baseURL,
		secret,
		session: {
			cookieCache: {
				enabled: true,
				// DB-less 構成では session の実体がこの暗号化 Cookie に載る。
				// 7 日間有効
				maxAge: 60 * 60 * 24 * 7,
			},
		},
		socialProviders: {
			github: {
				clientId:
					(env as unknown as Record<string, string | undefined>)
						.AUTH_GITHUB_ID ||
					env.GITHUB_CLIENT_ID ||
					"",
				clientSecret:
					(env as unknown as Record<string, string | undefined>)
						.AUTH_GITHUB_SECRET ||
					env.GITHUB_CLIENT_SECRET ||
					"",
				mapProfileToUser: (profile) => {
					return {
						name: profile.name || profile.login,
						email: profile.email,
						image: profile.avatar_url,
						githubUsername: profile.login,
					};
				},
			},
		},
		user: {
			additionalFields: {
				githubUsername: {
					type: "string",
					required: false,
					input: true,
				},
			},
			validateUserInfo: async ({ user, source }) => {
				// 登録・ログイン制限: allowedList (デフォルト: Nlkomaru) に一致するユーザーのみ許可
				const rawProfile = (
					source as { oauth?: { profile?: { login?: string } } }
				)?.oauth?.profile;
				const candidateIds = [
					user.id,
					user.name,
					user.email,
					(user as { githubUsername?: string }).githubUsername,
					rawProfile?.login,
				].filter(Boolean) as string[];

				const isAllowed = candidateIds.some((val) =>
					allowedList.includes(val.toLowerCase()),
				);

				if (!isAllowed) {
					return {
						error: "forbidden",
						errorDescription:
							"このブログは許可されたユーザーのみ執筆・ログインできます。",
					};
				}
			},
		},
		databaseHooks: {
			user: {
				create: {
					// user.id を GitHub の login (username) に固定する
					before: async (user) => {
						const username = (user as { githubUsername?: string })
							.githubUsername;
						if (typeof username === "string" && username.length > 0) {
							return { data: { id: username } };
						}
					},
				},
			},
		},
		plugins: [
			// TanStack Start 向けクッキープラグイン
			tanstackStartCookies(),
		],
	});
}

type Auth = Awaited<ReturnType<typeof buildAuth>>;

/**
 * 現在のリクエストの origin を baseURL としたメモ化済み BetterAuth
 * インスタンスを返す。リクエストコンテキスト内(サーバー関数・ルート
 * ハンドラー)からのみ呼び出せる。
 */
export function getAuth(): Promise<Auth> {
	const origin = new URL(getRequest().url).origin;
	let auth = authCache.get(origin);
	if (!auth) {
		auth = buildAuth(origin);
		authCache.set(origin, auth);
	}
	return auth;
}
