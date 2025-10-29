import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-muted-foreground text-center">
        <p>© {new Date().getFullYear()} stackload. All rights reserved.</p>
      </div>
    </footer>
  );
}
