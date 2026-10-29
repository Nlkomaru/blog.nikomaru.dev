import { createServerFn } from "@tanstack/react-start";

/**
 * クライアント（ルートの beforeLoad やヘッダー）から呼び出せる
 * セッションおよび執筆権限の検証 RPC。
 * クライアントバンドルにサーバー限定モジュールが漏れないよう、
 * handler 内で動的インポートする。
 */
export const checkAuthorSessionFn = createServerFn({ method: "GET" }).handler(
	async () => {
		try {
			const { getRequest } = await import("@tanstack/react-start/server");
			const { getAuth } = await import("./auth");
			const { isAllowedAuthor } = await import("./auth-server");

			const auth = await getAuth();
			const session = await auth.api.getSession({
				headers: getRequest().headers,
			});
			if (!session?.user) return null;
			return {
				id: session.user.id,
				name: session.user.name,
				email: session.user.email,
				image: session.user.image,
				isAuthor: isAllowedAuthor(session.user),
			};
		} catch {
			return null;
		}
	},
);
