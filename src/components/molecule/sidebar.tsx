"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Book, Link2, Paperclip } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Pages", icon: <Home size={18} /> },
  { href: "/admin/templates", label: "Template", icon: <Book size={18} /> },
  { href: "/admin/links", label: "Link", icon: <Link2 size={18} /> },
  { href: "/admin/forms", label: "Form", icon: <Paperclip size={18} /> },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r shadow-sm">
      <div className="p-4 text-lg font-semibold">
        <Link
          href={"/admin"}
          className="flex items-center text-primary gap-2 p-2 rounded hover:bg-primary-100 text-md"
        >
          Startiq
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 p-2 rounded hover:bg-primary-100 text-sm",
              pathname === item.href &&
                "bg-primary-100 text-primary font-medium",
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
