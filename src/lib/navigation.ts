import {
  BarChart3,
  Bell,
  CalendarDays,
  Flame,
  LayoutDashboard,
  ListTodo,
  NotebookPen,
  Settings,
  Target,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "My Tasks", href: "/tasks", icon: ListTodo },
      { label: "Calendar", href: "/calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Life",
    items: [
      { label: "Expenses", href: "/expenses", icon: Wallet },
      { label: "Habits", href: "/habits", icon: Flame },
      { label: "Notes", href: "/notes", icon: NotebookPen },
      { label: "Goals", href: "/goals", icon: Target },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Reports", href: "/reports", icon: BarChart3 },
      { label: "Notifications", href: "/notifications", icon: Bell },
    ],
  },
];

export const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/tasks": "My Tasks",
  "/calendar": "Calendar",
  "/expenses": "Expenses",
  "/habits": "Habits",
  "/notes": "Notes",
  "/goals": "Goals",
  "/reports": "Reports",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

export const mobileNavItems: NavItem[] = [
  { label: "Home", href: "/", icon: LayoutDashboard },
  { label: "Tasks", href: "/tasks", icon: ListTodo },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Money", href: "/expenses", icon: Wallet },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
