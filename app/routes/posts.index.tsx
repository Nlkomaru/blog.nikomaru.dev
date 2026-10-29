import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { Calendar, Folder, PenSquare, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { getAuth } from "../lib/auth";
import { isAllowedAuthor } from "../lib/auth-server";
import { getHagakiClient } from "../lib/hagaki";

const listPostsFn = createServerFn({ method: "GET" }).handler(async () => {
	const [client, auth] = await Promise.all([getHagakiClient(), getAuth()]);
	const session = await auth.api.getSession({
		headers: getRequest().headers,
	});
	const isAuthor = isAllowedAuthor(session?.user);

	try {
		const posts = await client.posts.list({ sortBy: "created", order: "desc" });
		return {
			posts: posts.map((p) => ({
				title: p.title,
				slug: p.slug,
				uuid: p.uuid,
				description: p.description,
				created: p.created,
				category: p.category,
			})),
			isAuthor,
		};
	} catch {
		return { posts: [], isAuthor };
	}
});

export const Route = createFileRoute("/posts/")({
	loader: () => listPostsFn(),
	component: PostsIndexPage,
});

function PostsIndexPage() {
	const { posts, isAuthor } = Route.useLoaderData();
	const [query, setQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

	const categories = Array.from(
		new Set(posts.map((p) => p.category).filter(Boolean)),
	) as string[];

	const filtered = posts.filter((post) => {
		const matchesQuery =
			!query ||
			post.title?.toLowerCase().includes(query.toLowerCase()) ||
			post.description?.toLowerCase().includes(query.toLowerCase()) ||
			post.slug.toLowerCase().includes(query.toLowerCase());
		const matchesCategory =
			!selectedCategory || post.category === selectedCategory;
		return matchesQuery && matchesCategory;
	});

	return (
		<section className="flex flex-col gap-6 max-w-4xl mx-auto">
			<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight mb-1">記事一覧</h1>
					<p className="text-sm text-muted-foreground mb-0">
						{posts.length} 件の記事が公開されています
					</p>
				</div>
				{isAuthor && (
					<Button asChild className="gap-1.5 self-start sm:self-auto">
						<Link to="/posts/new">
							<PenSquare className="w-4 h-4" />
							新規記事を作成
						</Link>
					</Button>
				)}
			</div>

			<Separator />

			{/* Filter and Search */}
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative flex-1">
					<Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="記事タイトルやキーワードで検索…"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
				{categories.length > 0 && (
					<div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
						<Badge
							variant={selectedCategory === null ? "default" : "outline"}
							className="cursor-pointer"
							onClick={() => setSelectedCategory(null)}
						>
							すべて
						</Badge>
						{categories.map((cat) => (
							<Badge
								key={cat}
								variant={selectedCategory === cat ? "default" : "outline"}
								className="cursor-pointer"
								onClick={() =>
									setSelectedCategory(cat === selectedCategory ? null : cat)
								}
							>
								{cat}
							</Badge>
						))}
					</div>
				)}
			</div>

			{filtered.length === 0 ? (
				<div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
					<p className="mb-0">条件に一致する記事が見つかりませんでした。</p>
					{isAuthor && (
						<Button asChild size="sm" variant="outline" className="mt-2">
							<Link to="/posts/new">新しい記事を投稿する</Link>
						</Button>
					)}
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{filtered.map((post) => (
						<Link
							key={post.slug}
							to="/posts/$slug"
							params={{ slug: post.slug }}
							preload="intent"
							className="group block focus:outline-none"
						>
							<Card className="h-full transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-sm flex flex-col justify-between">
								<CardHeader className="pb-3">
									<div className="flex items-center gap-2 mb-2">
										{post.category && (
											<Badge variant="secondary" className="gap-1 text-xs">
												<Folder className="w-3 h-3" />
												{post.category}
											</Badge>
										)}
										{post.created && (
											<span className="flex items-center gap-1 text-xs text-muted-foreground">
												<Calendar className="w-3 h-3" />
												{post.created.slice(0, 10)}
											</span>
										)}
									</div>
									<CardTitle className="text-base font-semibold group-hover:text-primary transition-colors leading-snug">
										{post.title || post.slug}
									</CardTitle>
									<CardDescription className="line-clamp-2 text-xs leading-relaxed mt-1">
										{post.description || "—"}
									</CardDescription>
								</CardHeader>
								<CardContent className="pt-0 text-xs text-primary font-medium">
									本文を読む →
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}
		</section>
	);
}
