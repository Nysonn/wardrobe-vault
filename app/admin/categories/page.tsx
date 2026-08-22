import { CategoryCreateForm } from "@/components/admin/category-create-form";
import { CategoryRow } from "@/components/admin/category-row";
import { EmptyState } from "@/components/brand/empty-state";
import { listAdminCategories } from "@/lib/services/admin/categories";

export default async function AdminCategoriesPage() {
  const categories = await listAdminCategories();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
          Categories
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage marketplace categories used in listing creation and browse filters.
        </p>
      </div>

      <CategoryCreateForm />

      <section>
        <h3 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          All categories
        </h3>
        {categories.length === 0 ? (
          <EmptyState
            className="py-10"
            title="No categories yet."
            description="Create the first category to organise listings in the Vault."
          />
        ) : (
          <ul className="mt-4 space-y-3">
            {categories.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
