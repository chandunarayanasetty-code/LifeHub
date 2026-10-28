import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Topbar } from "@/components/layout/topbar";
import { demoUser, getMockData } from "@/lib/mock-data";
import { buildSearchItems } from "@/lib/search";

// Preview data is generated relative to "today", so the shell renders per
// request rather than being frozen at build time.
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const data = getMockData();
  const unreadCount = data.notifications.filter(
    (notification) => !notification.read,
  ).length;
  const user = {
    fullName: demoUser.fullName,
    email: demoUser.email,
  };
  const searchItems = buildSearchItems(data);

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[268px_minmax(0,1fr)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <AppSidebar unreadCount={unreadCount} user={user} />

      <div className="flex min-w-0 flex-col">
        <Topbar
          searchItems={searchItems}
          unreadCount={unreadCount}
          user={user}
        />
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1400px] flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-7 lg:pt-8 lg:pb-12"
        >
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
