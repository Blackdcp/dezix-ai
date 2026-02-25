import { SessionProvider } from "next-auth/react";
import { ConsoleSidebar } from "@/components/layout/console-sidebar";
import { ConsoleHeader } from "@/components/layout/console-header";
import { Toaster } from "@/components/ui/sonner";

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex h-screen bg-[#f8f9fb]">
        <ConsoleSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <ConsoleHeader />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </SessionProvider>
  );
}
