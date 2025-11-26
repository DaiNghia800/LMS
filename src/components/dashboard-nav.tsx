"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BookOpen, Settings, LogOut } from "lucide-react";

const items = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Classes",
    href: "/dashboard/classes",
    icon: BookOpen,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2 p-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={index}
            href={item.href}
          >
            <span
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all",
                isActive ? "bg-primary/10 text-primary" : "transparent"
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}