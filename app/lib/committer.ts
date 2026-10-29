import type { Committer } from "@morinoparty/hagaki";
import { committerFromBetterAuth } from "@morinoparty/hagaki/auth/better-auth";
import { getRequest } from "@tanstack/react-start/server";
import { getAuth } from "./auth";

/**
 * git Committer の解決。
 *
 * Better Auth + GitHub OAuth のセッション情報から、GitHub アカウント
 * (id: ユーザー名, name: 表示名, email: メールアドレス) を取り出し、
 * hagaki の Committer (name: "Name (id)", email: "...") を作成する。
 */
export async function resolveCommitter(): Promise<Committer> {
	const auth = await getAuth();
	const session = await auth.api.getSession({
		headers: getRequest().headers,
	});
	const user = session?.user;
	if (!user) {
		throw new Error("committer: ユーザーがサインインしていません");
	}

	const userId = user.id || "Nlkomaru";
	const name = user.name || userId;
	const email = user.email || `${userId}@users.noreply.github.com`;

	const committer = committerFromBetterAuth(
		{ user: { id: userId, name, email } },
		{
			defaultEmail: `${userId}@users.noreply.github.com`,
		},
	);
	if (!committer) {
		throw new Error(
			"committer: セッション情報から Committer を生成できませんでした",
		);
	}
	return committer;
}
