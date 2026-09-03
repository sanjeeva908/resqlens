"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, History, Settings, Zap } from "lucide-react";
import { clsx } from "@/lib/utils";
import { DemoModeBadge } from "@/components/ui/DemoModeBadge";

const navItems = [
  { href: "/analyze", label: "Analyze Scene", icon: Eye },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800/80 bg-[#0a0f1e]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg py-1 px-1 transition-transform active:scale-95"
            aria-label="ResQLens Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-md shadow-red-900/40 group-hover:from-red-400 group-hover:to-red-600 transition-all border border-red-400/30">
              <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight leading-tight flex items-center gap-1">
                <span className="text-white">ResQ</span>
                <span className="text-red-500">Lens</span>
              </span>
              <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase -mt-0.5">
                AI Emergency Assistant
              </span>
            </div>
          </Link>

          <DemoModeBadge compact className="hidden md:inline-flex ml-2" />
        </div>

        {/* Navigation links & CTA */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <nav className="flex items-center gap-1 mr-1" aria-label="Main Navigation">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-gray-800/90 text-white shadow-inner border border-gray-700/60"
                      : "text-gray-400 hover:bg-gray-800/40 hover:text-gray-200"
                  )}
                >
                  <Icon className="h-4 w-4 text-gray-400" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>

          <Link
            href="/analyze"
            id="nav-try-demo-btn"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-red-900/30 transition-all hover:from-red-500 hover:to-red-400 hover:shadow-red-900/50 hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-red-400 border border-red-400/30"
          >
            <Zap className="h-4 w-4" />
            <span>Try Demo</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
