import {
	createRootRoute,
	HeadContent,
	Link,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { BookOpen, PenSquare, User as UserIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";
import { checkAuthorSessionFn } from "../lib/auth-fns";
import appCss from "../styles/app.css?url";

export const Route = createRootRoute({
	loader: () => checkAuthorSessionFn(),
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{ title: "blog.nikomaru.dev" },
		],
		links: [
			{ rel: "stylesheet", type: "text/css", href: appCss },
			{
				rel: "stylesheet",
				href: "https://cdn.jsdelivr.net/npm/@mdxeditor/editor@3/style.css",
			},
		],
	}),
	component: RootComponent,
});

const NAV_LINK =
	"px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors";
const NAV_ACTIVE = "bg-accent text-foreground font-semibold";

function RootComponent() {
	const session = Route.useLoaderData();

	return (
		<RootDocument>
			<header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
				<nav className="max-w-4xl mx-auto flex items-center justify-between px-4 md:px-6 h-14">
					<div className="flex items-center gap-1 sm:gap-2">
						<Link
							to="/"
							className="mr-3 flex items-center gap-2 font-bold tracking-tight text-foreground hover:opacity-90"
						>
							<BookOpen className="w-5 h-5 text-primary" />
							<span>blog.nikomaru.dev</span>
						</Link>
						<Link
							to="/"
							activeProps={{ className: NAV_ACTIVE }}
							activeOptions={{ exact: true }}
							className={NAV_LINK}
						>
							ホーム
						</Link>
						<Link
							to="/posts"
							activeProps={{ className: NAV_ACTIVE }}
							className={NAV_LINK}
						>
							記事
						</Link>
						<Link
							to="/categories"
							activeProps={{ className: NAV_ACTIVE }}
							className={NAV_LINK}
						>
							カテゴリ
						</Link>
					</div>

					<div className="flex items-center gap-2">
						{session?.isAuthor && (
							<Button
								asChild
								size="sm"
								variant="default"
								className="gap-1.5 hidden sm:inline-flex"
							>
								<Link to="/posts/new">
									<PenSquare className="w-3.5 h-3.5" />
									新規執筆
								</Link>
							</Button>
						)}
						<Button
							asChild
							size="sm"
							variant="ghost"
							className="gap-1.5 text-muted-foreground hover:text-foreground"
						>
							<Link to="/auth/sign-in">
								{session ? (
									<>
										{session.image ? (
											<img
												src={session.image}
												alt={session.name || "User"}
												className="w-5 h-5 rounded-full"
											/>
										) : (
											<UserIcon className="w-4 h-4" />
										)}
										<span className="text-xs font-medium max-w-[100px] truncate hidden sm:inline">
											{session.name || session.id}
										</span>
									</>
								) : (
									<>
										<UserIcon className="w-4 h-4" />
										<span>ログイン</span>
									</>
								)}
							</Link>
						</Button>
					</div>
				</nav>
			</header>
			<main className="max-w-4xl mx-auto px-4 md:px-6 py-8 min-h-[calc(100vh-120px)]">
				<Outlet />
			</main>
			<footer className="border-t py-6 bg-muted/20">
				<div className="max-w-4xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
					<p className="mb-0">
						© {new Date().getFullYear()} blog.nikomaru.dev. Powered by
						morinoparty/hagaki.
					</p>
					<div className="flex items-center gap-4">
						<a
							href="https://github.com/Nlkomaru/blog-content"
							target="_blank"
							rel="noreferrer"
							className="hover:underline"
						>
							Content Repository
						</a>
						<Link to="/auth/sign-in" className="hover:underline">
							執筆者管理
						</Link>
					</div>
				</div>
			</footer>
		</RootDocument>
	);
}

function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html lang="ja">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				{process.env.NODE_ENV === "development" && (
					<TanStackRouterDevtools position="bottom-right" />
				)}
				<Scripts />
			</body>
		</html>
	);
}
