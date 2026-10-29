import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { FolderTree, Pencil, Plus } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { getAuth } from "../lib/auth";
import { isAllowedAuthor } from "../lib/auth-server";
import { listCategoriesFn } from "../lib/category-server";

const getCategoriesDataFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: getRequest().headers,
		});
		const isAuthor = isAllowedAuthor(session?.user);
		const categories = await listCategoriesFn();
		return {
			categories,
			isAuthor,
		};
	},
);

export const Route = createFileRoute("/categories/")({
	loader: () => getCategoriesDataFn(),
	component: CategoriesIndexPage,
});

function CategoriesIndexPage() {
	const { categories, isAuthor } = Route.useLoaderData();
	return (
		<section className="flex flex-col gap-6 max-w-4xl mx-auto">
			<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight mb-1">カテゴリ</h1>
					<p className="text-sm text-muted-foreground mb-0">
						{categories.length} 件のカテゴリ
					</p>
				</div>
				{isAuthor && (
					<Button asChild className="gap-1.5 self-start sm:self-auto">
						<Link to="/categories/new">
							<Plus className="w-4 h-4" />
							新規カテゴリ
						</Link>
					</Button>
				)}
			</div>
			<Separator />
			{categories.length === 0 ? (
				<div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
					<FolderTree className="w-8 h-8 opacity-40 mb-1" />
					<p className="mb-0">カテゴリがまだ登録されていません。</p>
					{isAuthor && (
						<Button asChild size="sm" variant="outline" className="mt-2">
							<Link to="/categories/new">最初のカテゴリを作成する</Link>
						</Button>
					)}
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{categories.map((category) => (
						<Card
							key={category.slug}
							className="h-full flex flex-col justify-between"
						>
							<CardHeader>
								<div className="flex items-center justify-between mb-2">
									<Badge variant="outline" className="text-xs">
										{category.slug}
									</Badge>
									{isAuthor && (
										<Button
											asChild
											variant="ghost"
											size="sm"
											className="h-7 px-2 text-xs gap-1 text-muted-foreground"
										>
											<Link
												to="/categories/$slug/edit"
												params={{ slug: category.slug }}
											>
												<Pencil className="w-3 h-3" />
												編集
											</Link>
										</Button>
									)}
								</div>
								<CardTitle className="text-lg">
									{category.title || category.slug}
								</CardTitle>
								<CardDescription className="text-xs leading-relaxed line-clamp-3">
									{category.body || "説明はありません"}
								</CardDescription>
							</CardHeader>
							<div className="px-6 pb-4">
								<Button
									asChild
									variant="secondary"
									size="sm"
									className="w-full text-xs"
								>
									<Link to="/posts" search={{ category: category.slug }}>
										このカテゴリの記事一覧を見る →
									</Link>
								</Button>
							</div>
						</Card>
					))}
				</div>
			)}
		</section>
	);
}
