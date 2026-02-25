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
      <div className="mx-auto flex max-w-7xl">
        <DocsSidebar />
        <main className="min-h-[calc(100vh-4rem)] flex-1 px-6 py-10 lg:px-12">
          {children}
        </main>
      </div>
    </>
  );
}
