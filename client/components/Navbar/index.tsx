import React, { useState } from "react";
import { Menu, Moon, Search, Settings, Sun, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { UserButton, SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';

const Navbar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 3) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit(e);
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-black">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
          className="md:hidden rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm placeholder-gray-500 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-900"
            type="search"
            placeholder="Search tasks, projects, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          {searchQuery.trim().length >= 3 && (
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
              Go
            </button>
          )}
        </form>
      </div>

      {/* Icons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
        <Link
          href="/settings"
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </Link>
        <div className="mx-2 hidden h-8 w-px bg-gray-200 dark:bg-gray-700 md:block"></div>
        <div className="hidden items-center justify-center md:flex">
          <SignedIn>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.firstName || user?.emailAddresses[0]?.emailAddress || 'User'}
              </span>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 ring-2 ring-gray-200 dark:ring-gray-700",
                  },
                }}
              />
            </div>
          </SignedIn>
          <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
