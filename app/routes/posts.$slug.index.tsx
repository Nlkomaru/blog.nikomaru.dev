import type { WikiPostDetail } from "@morinoparty/hagaki";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { ArrowLeft, Calendar, Folder, Pencil } from "lucide-react";
import { PostBody } from "~/components/post-body";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { getAuth } from "../lib/auth";
import { isAllowedAuthor } from "../lib/auth-server";
import { getHagakiClient } from "../lib/hagaki";
import { getStringEnv } from "../lib/server-env";

const getPostFn = createServerFn({ method: "GET" })
	.validator((slug: string) => slug)
	.handler(async ({ data: slug }) => {
		const { env } = await import("cloudflare:workers");
		const [client, auth] = await Promise.all([getHagakiClient(), getAuth()]);
		const session = await auth.api.getSession({
			headers: getRequest().headers,
		});
		let post: WikiPostDetail | null = null;
		try {
			post = await client.posts.getBySlug(slug);
		} catch {
			post = null;
		}
		if (!post) return null;
		return {
			title: post.title,
			slug: post.slug,
			uuid: post.uuid,
			description: post.description,
			created: post.created,
			category: post.category,
			body: post.body,
			cdnBaseUrl: getStringEnv(env, "HAGAKI_CDN_BASE_URL"),
			isAuthor: isAllowedAuthor(session?.user),
		};
	});

export const Route = createFileRoute("/posts/$slug/")({
	loader: async ({ params }) => {
		const result = await getPostFn({ data: params.slug });
		if (!result) throw notFound();
		return result;
	},
	head: ({ loaderData }) =>
		loaderData
			? {
					meta: [
						{
							title: `${loaderData.title || loaderData.slug} - blog.nikomaru.dev`,
						},
						{
							name: "description",
							content: loaderData.description,
						},
					],
				}
			: {},
	component: PostViewPage,
});

function PostViewPage() {
	const post = Route.useLoaderData();
	return (
		<article className="flex flex-col gap-6 max-w-3xl mx-auto">
			<div className="flex items-center justify-between">
				<Button
					asChild
					variant="ghost"
					size="sm"
					className="-ml-2 w-fit text-muted-foreground hover:text-foreground gap-1"
				>
					<Link to="/posts">
						<ArrowLeft className="w-4 h-4" />
						記事一覧へ
					</Link>
				</Button>

				{post.isAuthor && (
					<Button asChild size="sm" variant="outline" className="gap-1.5">
						<Link to="/posts/$slug/edit" params={{ slug: post.slug }}>
							<Pencil className="w-3.5 h-3.5" />
							編集する
						</Link>
					</Button>
				)}
			</div>

			<header className="flex flex-col gap-3">
				<div className="flex items-center gap-2">
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
				<h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-0">
					{post.title || post.slug}
				</h1>
				{post.description && (
					<p className="text-base text-muted-foreground mb-0 leading-relaxed">
						{post.description}
					</p>
				)}
			</header>

			<Separator />

			{/* remark-mdx + rehype-react による React 要素レンダリング。
                本文中の <Image /> は hagaki/react の <Image>(blurhash
                プレースホルダ内蔵)に直接マップされる。 */}
			<div className="py-2">
				<PostBody
					markdown={post.body}
					articleId={post.uuid}
					cdnBaseUrl={post.cdnBaseUrl}
					className="prose prose-neutral max-w-none dark:prose-invert"
				/>
			</div>

			<Separator />

			<div className="flex items-center justify-between pt-2">
				<Button
					asChild
					variant="ghost"
					size="sm"
					className="gap-1 text-muted-foreground"
				>
					<Link to="/posts">
						<ArrowLeft className="w-4 h-4" />
						記事一覧へ戻る
					</Link>
				</Button>
				{post.isAuthor && (
					<Button asChild size="sm">
						<Link to="/posts/$slug/edit" params={{ slug: post.slug }}>
							<Pencil className="w-4 h-4 mr-1.5" />
							この記事を編集
						</Link>
					</Button>
				)}
			</div>
		</article>
	);
}
