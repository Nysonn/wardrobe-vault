import Link from "next/link";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-zinc-950">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="text-sm font-medium tracking-[0.2em] uppercase text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          Wardrobe Vault
        </Link>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
