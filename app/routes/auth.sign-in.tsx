import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { LogOut, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { GithubIcon } from "~/components/ui/github-icon";
import { getAuth } from "../lib/auth";
import { checkAuthorSessionFn } from "../lib/auth-fns";

const signInFn = createServerFn({ method: "POST" }).handler(async () => {
	const auth = await getAuth();
	const result = await auth.api.signInSocial({
		body: {
			provider: "github",
			callbackURL: "/",
		},
	});
	if (!result.url) throw new Error("GitHub sign-in returned no URL");
	const redirectUrl = result.url;
	return { redirectUrl };
});

const signOutFn = createServerFn({ method: "POST" }).handler(async () => {
	const { getRequest } = await import("@tanstack/react-start/server");
	const auth = await getAuth();
	await auth.api.signOut({ headers: getRequest().headers });
	return { ok: true };
});

export const Route = createFileRoute("/auth/sign-in")({
	loader: () => checkAuthorSessionFn(),
	component: SignInPage,
});

function SignInPage() {
	const session = Route.useLoaderData();
	const router = useRouter();
	const [busy, setBusy] = useState(false);

	async function onSignIn() {
		setBusy(true);
		try {
			const { redirectUrl } = await signInFn();
			window.location.href = redirectUrl;
		} catch {
			setBusy(false);
		}
	}

	async function onSignOut() {
		setBusy(true);
		try {
			await signOutFn();
			await router.invalidate();
		} finally {
			setBusy(false);
		}
	}

	return (
		<section className="flex flex-col items-center justify-center py-12 px-4">
			<Card className="w-full max-w-md shadow-sm">
				<CardHeader className="text-center">
					<CardTitle className="text-xl">アカウント認証</CardTitle>
					<CardDescription>
						blog.nikomaru.dev の執筆・管理用ログイン
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{session ? (
						<div className="flex flex-col gap-4">
							<div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
								{session.image && (
									<img
										src={session.image}
										alt={session.name || "Avatar"}
										className="w-10 h-10 rounded-full border"
									/>
								)}
								<div className="flex-1 min-w-0">
									<p className="font-medium text-sm truncate mb-0">
										{session.name}
									</p>
									<p className="text-xs text-muted-foreground truncate mb-0">
										@{session.id} ({session.email})
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								{session.isAuthor ? (
									<Badge
										variant="default"
										className="gap-1 bg-emerald-600 hover:bg-emerald-700"
									>
										<ShieldCheck className="w-3.5 h-3.5" />
										執筆権限あり (管理者)
									</Badge>
								) : (
									<Badge variant="destructive" className="gap-1">
										<ShieldAlert className="w-3.5 h-3.5" />
										執筆権限なし (閲覧のみ)
									</Badge>
								)}
							</div>

							{!session.isAuthor && (
								<p className="text-xs text-destructive">
									このブログの執筆権限は登録された作者（自分だけ）に制限されています。
								</p>
							)}
						</div>
					) : (
						<div className="flex flex-col gap-3">
							<p className="text-sm text-muted-foreground">
								このブログの記事閲覧は自由に行えます。記事の作成・編集および画像のアップロードを行うには、GitHubアカウントでのサインインが必要です。
							</p>
							<div className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
								<strong>※アクセス制限について:</strong>{" "}
								登録された執筆者（自分）以外のサインインおよび執筆はBetter
								Authにより制限されています。
							</div>
						</div>
					)}
				</CardContent>
				<CardFooter className="flex justify-end gap-2">
					{session ? (
						<Button
							type="button"
							variant="outline"
							disabled={busy}
							onClick={onSignOut}
							className="w-full gap-2"
						>
							<LogOut className="w-4 h-4" />
							サインアウト
						</Button>
					) : (
						<Button
							type="button"
							disabled={busy}
							onClick={onSignIn}
							className="w-full gap-2"
						>
							<GithubIcon className="w-4 h-4" />
							{busy ? "GitHubへリダイレクト中…" : "GitHubでサインイン"}
						</Button>
					)}
				</CardFooter>
			</Card>
		</section>
	);
}
