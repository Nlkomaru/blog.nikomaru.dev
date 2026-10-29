import { createFileRoute, redirect } from "@tanstack/react-router";
import { CategoryForm } from "~/components/CategoryForm";
import { checkAuthorSessionFn } from "../lib/auth-fns";
import { listCategoriesFn } from "../lib/category-server";

export const Route = createFileRoute("/categories/new")({
	beforeLoad: async () => {
		const session = await checkAuthorSessionFn();
		if (!session?.isAuthor) {
			throw redirect({
				to: "/auth/sign-in",
			});
		}
	},
	loader: () => listCategoriesFn(),
	component: NewCategoryPage,
});

function NewCategoryPage() {
	const categories = Route.useLoaderData();
	return (
		<CategoryForm
			slugLocked={false}
			existingSlugs={categories.map((c) => c.slug)}
			initial={{ title: "", slug: "", body: "" }}
		/>
	);
}
