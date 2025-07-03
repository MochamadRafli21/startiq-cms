"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Book, Link2, Paperclip, Settings, Folder } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Pages", icon: <Home size={18} /> },
  { href: "/admin/templates", label: "Template", icon: <Book size={18} /> },
  { href: "/admin/links", label: "Link", icon: <Link2 size={18} /> },
  { href: "/admin/assets", label: "Asset", icon: <Folder size={18} /> },
  { href: "/admin/forms", label: "Form", icon: <Paperclip size={18} /> },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <div className="min-w-64" />
      <aside className="w-64 bg-white border-r h-screen fixed top-0 shadow-sm">
        <div className="px-4 py-2 text-lg font-semibold border-b">
          <Link
            href={"/admin"}
            className="flex items-center text-primary gap-2 p-2 rounded-md transition-colors ease-in hover:bg-violet-100 text-2xl font-semibold"
          >
            <Image
              width={24}
              height={24}
              alt="Link Banner"
              className="rounded-full"
              src="/logo.png"
            />
            Startiq
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 p-2 rounded hover:bg-violet-300 text-sm transition-colors ease-linear",
                pathname === item.href &&
                  "bg-primary hover:bg-primary text-white font-medium",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-2 absolute bottom-10 w-full">
          <Link
            href="/admin/settings"
            className={cn(
              "w-full flex items-center rounded hover:bg-primary text-sm transition-colors ease-linear py-2 px-4 hover:text-primary-foreground",
              pathname === "/admin/settings" &&
                "bg-primary hover:bg-primary text-white font-medium",
            )}
          >
            <Settings />
            Settings
          </Link>
        </div>
      </aside>
    </>
  );
}
