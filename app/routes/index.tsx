import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import {
	ArrowRight,
	BookOpen,
	Calendar,
	FolderTree,
	PenSquare,
	Sparkles,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { GithubIcon } from "~/components/ui/github-icon";
import { Separator } from "~/components/ui/separator";
import { getAuth } from "../lib/auth";
import { isAllowedAuthor } from "../lib/auth-server";
import { getHagakiClient } from "../lib/hagaki";

const getHomeDataFn = createServerFn({ method: "GET" }).handler(async () => {
	const [client, auth] = await Promise.all([getHagakiClient(), getAuth()]);

	const session = await auth.api.getSession({
		headers: getRequest().headers,
	});
	const isAuthor = isAllowedAuthor(session?.user);

	let posts: Array<{
		title: string;
		slug: string;
		uuid: string;
		description: string;
		created: string;
		category?: string;
	}> = [];

	let categories: Array<{
		title: string;
		slug: string;
	}> = [];

	try {
		const [postList, categoryList] = await Promise.all([
			client.posts.list({ sortBy: "created", order: "desc" }),
			client.categories.list(),
		]);
		posts = postList.slice(0, 6).map((p) => ({
			title: p.title,
			slug: p.slug,
			uuid: p.uuid,
			description: p.description,
			created: p.created ?? "",
			category: p.category,
		}));
		categories = categoryList.map((c) => ({
			title: c.title,
			slug: c.slug,
		}));
	} catch {
		// Fallback for initial state before content deployment
	}

	return {
		posts,
		categories,
		isAuthor,
		userName: session?.user?.name || session?.user?.id,
	};
});

export const Route = createFileRoute("/")({
	loader: () => getHomeDataFn(),
	component: HomePage,
});

function HomePage() {
	const { posts, categories, isAuthor, userName } = Route.useLoaderData();

	return (
		<div className="flex flex-col gap-12">
			{/* Hero Section */}
			<section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-muted/40 p-8 sm:p-12 shadow-sm">
				<div className="flex flex-col gap-4 max-w-2xl">
					<div className="flex items-center gap-2">
						<Badge
							variant="outline"
							className="gap-1.5 py-1 px-3 text-xs font-medium"
						>
							<Sparkles className="w-3.5 h-3.5 text-primary" />
							TanStack Start + hagaki
						</Badge>
						{isAuthor && (
							<Badge variant="secondary" className="text-xs">
								執筆者: {userName}
							</Badge>
						)}
					</div>
					<h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-0">
						blog.nikomaru.dev
					</h1>
					<p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-2">
						Nlkomaru による技術・開発ログ。GitHub をコンテンツストレージにする
						Headless CMS「morinoparty/hagaki」と TanStack Start + shadcn
						で構築されています。
					</p>
					<div className="flex flex-wrap items-center gap-3 pt-2">
						<Button asChild size="default" className="gap-2">
							<Link to="/posts">
								<BookOpen className="w-4 h-4" />
								記事を読む
							</Link>
						</Button>
						{isAuthor ? (
							<Button
								asChild
								variant="outline"
								size="default"
								className="gap-2"
							>
								<Link to="/posts/new">
									<PenSquare className="w-4 h-4" />
									新しい記事を書く
								</Link>
							</Button>
						) : (
							<Button
								asChild
								variant="outline"
								size="default"
								className="gap-2"
							>
								<a
									href="https://github.com/Nlkomaru"
									target="_blank"
									rel="noreferrer"
								>
									<GithubIcon className="w-4 h-4" />
									GitHub Profile
								</a>
							</Button>
						)}
					</div>
				</div>
			</section>

			{/* Recent Posts Section */}
			<section className="flex flex-col gap-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold tracking-tight mb-1">
							最新の記事
						</h2>
						<p className="text-sm text-muted-foreground mb-0">
							最近投稿された記事の一覧です
						</p>
					</div>
					<Button
						asChild
						variant="ghost"
						size="sm"
						className="gap-1 text-muted-foreground hover:text-foreground"
					>
						<Link to="/posts">
							すべて見る
							<ArrowRight className="w-4 h-4" />
						</Link>
					</Button>
				</div>

				{posts.length === 0 ? (
					<Card className="border-dashed">
						<CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
							<BookOpen className="w-8 h-8 mb-2 opacity-50" />
							<p className="font-medium text-sm mb-1">
								記事がまだ公開されていません
							</p>
							<p className="text-xs text-muted-foreground max-w-sm mb-4">
								コンテンツリポジトリ <code>Nlkomaru/blog-content</code>{" "}
								に記事を追加するとここに表示されます。
							</p>
							{isAuthor && (
								<Button asChild size="sm">
									<Link to="/posts/new">
										<PenSquare className="w-4 h-4 mr-1" />
										最初の記事を執筆する
									</Link>
								</Button>
							)}
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{posts.map((post) => (
							<Link
								key={post.slug}
								to="/posts/$slug"
								params={{ slug: post.slug }}
								className="group block focus:outline-none"
							>
								<Card className="h-full transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-md flex flex-col justify-between">
									<CardHeader className="pb-3">
										<div className="flex items-center gap-2 mb-2">
											{post.category && (
												<Badge variant="secondary" className="text-xs">
													{post.category}
												</Badge>
											)}
											{post.created && (
												<span className="flex items-center text-xs text-muted-foreground gap-1">
													<Calendar className="w-3 h-3" />
													{post.created.slice(0, 10)}
												</span>
											)}
										</div>
										<CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors">
											{post.title || post.slug}
										</CardTitle>
										<CardDescription className="line-clamp-2 text-xs leading-relaxed mt-1">
											{post.description || "—"}
										</CardDescription>
									</CardHeader>
									<CardContent className="pt-0">
										<span className="text-xs font-medium text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
											記事を読む
											<ArrowRight className="w-3.5 h-3.5" />
										</span>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				)}
			</section>

			{/* Categories Section */}
			{categories.length > 0 && (
				<section className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-bold tracking-tight mb-0">カテゴリ</h2>
						<Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
							<Link to="/categories">
								<FolderTree className="w-3.5 h-3.5" />
								カテゴリ一覧
							</Link>
						</Button>
					</div>
					<div className="flex flex-wrap gap-2">
						{categories.map((cat) => (
							<Link
								key={cat.slug}
								to="/posts"
								search={{ category: cat.slug }}
								className="inline-block"
							>
								<Badge
									variant="outline"
									className="py-1.5 px-3 text-xs hover:bg-accent transition-colors cursor-pointer"
								>
									{cat.title || cat.slug}
								</Badge>
							</Link>
						))}
					</div>
				</section>
			)}

			<Separator />

			{/* Architecture Overview Section */}
			<section className="rounded-xl border bg-card p-6">
				<div className="flex flex-col gap-3">
					<h3 className="text-base font-semibold mb-0">システム構成 & 連携</h3>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground pt-1">
						<div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30 border">
							<span className="font-semibold text-foreground">
								Content Repository
							</span>
							<code>Nlkomaru/blog-content</code>
							<p className="mb-0">
								記事本体 (MDX) と画像 (AVIF) を 1 コミットで GitHub 上に管理
							</p>
						</div>
						<div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30 border">
							<span className="font-semibold text-foreground">
								Auth & Access Control
							</span>
							<span>Better Auth (GitHub OAuth)</span>
							<p className="mb-0">
								許可されたユーザー（Nlkomaru）のみ執筆・編集できるようログイン制限
							</p>
						</div>
						<div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30 border">
							<span className="font-semibold text-foreground">
								Framework & UI
							</span>
							<span>TanStack Start + shadcn</span>
							<p className="mb-0">
								高速な SSR・型安全ルーティング・Tailwind CSS
								による洗練されたデザイン
							</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
