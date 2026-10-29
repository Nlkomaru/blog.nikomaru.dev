import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { CategoryForm } from "~/components/CategoryForm";
import { checkAuthorSessionFn } from "../lib/auth-fns";
import { getCategoryFn } from "../lib/category-server";

export const Route = createFileRoute("/categories/$slug/edit")({
	beforeLoad: async () => {
		const session = await checkAuthorSessionFn();
		if (!session?.isAuthor) {
			throw redirect({
				to: "/auth/sign-in",
			});
		}
	},
	loader: async ({ params }) => {
		const category = await getCategoryFn({ data: params.slug });
		if (!category) throw notFound();
		return category;
	},
	component: EditCategoryPage,
});

function EditCategoryPage() {
	const category = Route.useLoaderData();
	return <CategoryForm slugLocked initial={category} />;
}
