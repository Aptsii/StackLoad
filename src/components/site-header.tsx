"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Layers3,
  User,
  Bell,
  MessageSquare,
  Settings,
  LogOut,
  Search,
  Home,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import Image from "next/image";

export function SiteHeader() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/stackloadLogo.svg"
              alt="stackload 개발자 커뮤니티"
              width={180}
              height={42}
              priority
              className="h-25 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 mx-auto">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 transition-all duration-200"
            >
              <Home className="size-4" />홈
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 transition-all duration-200"
            >
              <Search className="size-4" />
              기술 탐색
            </Link>
            <Link
              href="/community"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 transition-all duration-200"
            >
              <Users className="size-4" />
              커뮤니티
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <NotificationDropdown />

            {/* User Menu */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || ""}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover rounded-full"
                          referrerPolicy="no-referrer" // ← 구글 이미지 차단 방지
                        />
                      ) : (
                        <span className="text-white text-2xl font-bold">
                          {session.user.name?.[0]?.toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-sm font-medium">
                        {session.user.name || "사용자"}
                      </span>
                      <span className="text-xs text-gray-500">개발자</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="p-3 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {session.user.image ? (
                          <Image
                            src={session.user.image}
                            alt={session.user.name || ""}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover rounded-full"
                            referrerPolicy="no-referrer" // ← 구글 이미지 차단 방지
                          />
                        ) : (
                          <span className="text-white text-2xl font-bold">
                            {session.user.name?.[0]?.toUpperCase() || "U"}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {session.user.name || "사용자"}님
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>개발자</span>
                          <Badge className="bg-blue-100 text-blue-700 text-xs">
                            Mid-Level
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="lg:hidden border-b">
                    <DropdownMenuLabel>메뉴</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href="/" className="flex items-center gap-2">
                        <Home className="size-4" />홈
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/search" className="flex items-center gap-2">
                        <Search className="size-4" />
                        기술 탐색
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/community"
                        className="flex items-center gap-2"
                      >
                        <Users className="size-4" />
                        커뮤니티
                      </Link>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="size-4" />내 프로필
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="size-4" />
                      설정
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-red-600 cursor-pointer"
                    onClick={() => signOut()}
                  >
                    <LogOut className="size-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => signIn()}
                className="hover:text-gray-900 hover:bg-gray-100/80 transition-all duration-200 bg-white text-black"
              >
                로그인
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
