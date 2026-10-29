import { env } from "cloudflare:workers";
import { getRequest } from "@tanstack/react-start/server";
import { getAuth } from "./auth";

/**
 * ユーザーがブログの執筆を許可されているか検証
 */
export function isAllowedAuthor(
	user:
		| { id?: string | null; name?: string | null; email?: string | null }
		| null
		| undefined,
): boolean {
	if (!user) return false;
	const allowedList = (env.ALLOWED_USERS || "Nlkomaru")
		.split(",")
		.map((u) => u.trim().toLowerCase());
	const candidates = [user.id, user.name, user.email].filter(
		Boolean,
	) as string[];
	return candidates.some((val) => allowedList.includes(val.toLowerCase()));
}

/**
 * エンドポイント単位のセッションおよび執筆権限の検証。
 *
 * 書き込み系・編集系のサーバー関数は必ずハンドラ冒頭でこれを呼ぶこと。
 * 未認証は 401、執筆権限のないユーザーは 403 JSON を返す。
 */
export async function requireSession() {
	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: getRequest().headers,
	});
	if (!session?.user) {
		throw new Response(
			JSON.stringify({
				error: "unauthorized",
				message: "サインインが必要です (/auth/sign-in)",
			}),
			{
				status: 401,
				headers: { "content-type": "application/json" },
			},
		);
	}

	if (!isAllowedAuthor(session.user)) {
		throw new Response(
			JSON.stringify({
				error: "forbidden",
				message:
					"このユーザーには執筆権限がありません（許可されたユーザーのみ執筆可能です）",
			}),
			{
				status: 403,
				headers: { "content-type": "application/json" },
			},
		);
	}

	return session;
}
