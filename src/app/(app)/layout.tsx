import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Topbar } from "@/components/layout/topbar";
import { requireUser } from "@/lib/auth/session";
import {
  getUnreadNotificationCount,
  syncNotifications,
} from "@/lib/notifications/repository";
import { buildSearchItems } from "@/lib/search";
import { getWorkspaceData } from "@/lib/workspace";

// Dashboard data is relative to "today", so the shell renders per request.
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  // Keep generated reminders current before rendering the unread badge.
  try {
    await syncNotifications(user.id);
  } catch (error) {
    console.error("[notifications] Reminder sync failed", error);
  }

  const [workspace, unreadCount] = await Promise.all([
    getWorkspaceData(user.id),
    getUnreadNotificationCount(user.id),
  ]);

  const searchItems = buildSearchItems({
    tasks: workspace.tasks,
    notes: workspace.notes,
  });

  const sidebarUser = {
    fullName: user.name,
    email: user.email,
    isDemo: user.isDemo,
  };

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[268px_minmax(0,1fr)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <AppSidebar unreadCount={unreadCount} user={sidebarUser} />

      <div className="flex min-w-0 flex-col">
        <Topbar
          searchItems={searchItems}
          unreadCount={unreadCount}
          user={sidebarUser}
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
