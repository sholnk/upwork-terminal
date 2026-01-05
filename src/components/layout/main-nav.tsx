"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  Search,
  FileText,
  Briefcase,
  Users,
  Settings,
  Menu,
  X,
} from "lucide-react";

/**
 * MainNav Component
 *
 * メインナビゲーション（サイドバー）
 * ダッシュボード全体を統括
 */
export function MainNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    {
      label: "ダッシュボード",
      href: "/",
      icon: Home,
    },
    {
      label: "案件リサーチ",
      href: "/jobs",
      icon: Search,
    },
    {
      label: "提案管理",
      href: "/proposals",
      icon: FileText,
    },
    {
      label: "契約管理",
      href: "/contracts",
      icon: Briefcase,
    },
    {
      label: "クライアント",
      href: "/clients",
      icon: Users,
    },
    {
      label: "設定",
      href: "/settings",
      icon: Settings,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <nav
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white p-6 transition-transform lg:translate-x-0 z-40",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            UpWork <span className="text-blue-400">Terminal</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Freelance Management</p>
        </div>

        {/* Navigation Items */}
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-sm",
                  active
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-6 right-6 border-t border-gray-700 pt-6">
          <p className="text-xs text-gray-500 text-center">
            v0.1.0 • Beta
          </p>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
