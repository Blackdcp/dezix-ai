import { MarketingHeader } from "@/components/layout/marketing-header";
import { DocsSidebar } from "@/components/layout/docs-sidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingHeader />
      <div className="mx-auto flex max-w-6xl">
        <DocsSidebar />
        <main className="min-h-[calc(100vh-3.5rem)] flex-1 px-6 py-8 lg:px-12">
          {children}
        </main>
      </div>
    </>
  );
}
