import {
  Boxes,
  FolderKanban,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  MessageSquareQuote,
  Settings,
  Shapes,
  Tags,
  UserCog,
  UserRound,
  Users,
} from "lucide-react";
import { Suspense } from "react";
import { AdminShell, NavLink } from "@/components/admin/AdminShell";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { ToastProvider } from "@/components/admin/toast";
import { can, type Permission } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";

const links: { href: string; label: string; icon: typeof Boxes; permission: Permission }[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    permission: "dashboard.view",
  },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban, permission: "content.manage" },
  { href: "/admin/categories", label: "Categories", icon: Tags, permission: "content.manage" },
  { href: "/admin/services", label: "Services", icon: Shapes, permission: "content.manage" },
  { href: "/admin/clients", label: "Clients", icon: Boxes, permission: "content.manage" },
  {
    href: "/admin/testimonials",
    label: "Testimonials",
    icon: MessageSquareQuote,
    permission: "content.manage",
  },
  { href: "/admin/team", label: "Team", icon: Users, permission: "content.manage" },
  { href: "/admin/media", label: "Media", icon: ImageIcon, permission: "content.manage" },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox, permission: "inquiries.manage" },
  { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings.manage" },
  { href: "/admin/users", label: "Users", icon: UserCog, permission: "users.view" },
  { href: "/admin/account", label: "My account", icon: UserRound, permission: "dashboard.view" },
];

async function Nav() {
  const user = await requirePermission("dashboard.view");
  return (
    <nav aria-label="Admin" className="space-y-0.5">
      {links
        .filter((link) => can(user.role, link.permission))
        .map(({ href, label, icon: Icon }) => (
          <NavLink key={href} href={href}>
            <Icon aria-hidden className="size-4" />
            {label}
          </NavLink>
        ))}
    </nav>
  );
}

async function UserBar() {
  const user = await requirePermission("dashboard.view");
  return (
    <>
      <span className="truncate text-sm text-muted">
        {user.name} <span className="hidden sm:inline">({user.role.toLowerCase()})</span>
      </span>
      <SignOutButton />
    </>
  );
}

export default function PanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ToastProvider>
      <AdminShell
        nav={
          <Suspense>
            <Nav />
          </Suspense>
        }
        user={
          <Suspense>
            <UserBar />
          </Suspense>
        }
      >
        {children}
      </AdminShell>
    </ToastProvider>
  );
}
