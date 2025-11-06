"use client";

import React, { useState } from "react";
import {
  Icon,
  Lock,
  LucideIcon,
  Home,
  X,
  Search,
  Briefcase,
  Settings,
  User,
  Users,
  Users2,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  Layers3,
  Menu,
  Folder,
  Flag,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import Link from "next/link";
import { setIsSidebarCollapsed } from "@/state";

const Sidebar = () => {
  const [showProjects, setShowProjects] = useState(true);
  const [showPriority, setShowPriority] = useState(true);

  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );

  const sidebarClassNames = `fixed flex h-full flex-col justify-between shadow-xl transition-all duration-300 z-40 overflow-y-auto bg-white dark:bg-gray-900 ${isSidebarCollapsed ? "w-16" : "w-64"}`;

  return (
    <div className={sidebarClassNames}>
      <div className="flex h-full w-full flex-col justify-start">
        {/* Header top LOGO */}
        <div
          className={`z-50 flex min-h-[50px] items-center bg-white px-6 pt-3 dark:bg-gray-900 ${isSidebarCollapsed ? "justify-center" : "justify-between"}`}
        >
          {!isSidebarCollapsed && (
            <div className="text-xl font-bold text-gray-800 dark:text-white">
              Laurier Cricket
            </div>
          )}
          <button
            className="py-3"
            onClick={() => {
              dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
            }}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <Menu className="h-6 w-6 text-gray-800 hover:text-gray-500 dark:text-white" />
            ) : (
              <X className="h-6 w-6 text-gray-800 hover:text-gray-500 dark:text-white" />
            )}
          </button>
        </div>

        {/* Teams */}
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-5 border-y-[1.5px] border-gray-200 px-8 py-4 dark:border-gray-700">
            <img src="/logo.png" alt="Logo" width={40} height={40} />
            <div>
              <h3 className="text-base font-bold tracking-wide text-gray-800 dark:text-white">
                Cricket Team 1
              </h3>
              <div className="mt-1 flex items-start gap-2">
                <Lock className="mt-[0.1rem] h-3 w-3 text-gray-500 dark:text-gray-400" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Private
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Links for navbar */}
        <nav className="z-10 w-full">
          <SidebarLink icon={Home} label="Home" href="/" />
          <SidebarLink icon={Briefcase} label="Timeline" href="/timeline" />
          <SidebarLink icon={Search} label="Search" href="/search" />
          <SidebarLink icon={Settings} label="Settings" href="/settings" />
          <SidebarLink icon={User} label="Users" href="/users" />
          <SidebarLink icon={Users2} label="Teams" href="/teams" />
        </nav>

        {/* links for projects */}
        <button
          onClick={() => setShowProjects((prev) => !prev)}
          className={`flex w-full items-center transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 ${isSidebarCollapsed ? "justify-center px-3 py-3" : "justify-between px-8 py-3"}`}
        >
          <div className="flex items-center gap-3">
            <Folder className="h-6 w-6 text-gray-800 dark:text-gray-100" />
            {!isSidebarCollapsed && (
              <span className="font-medium text-gray-800 dark:text-gray-100">
                Projects
              </span>
            )}
          </div>
          {!isSidebarCollapsed && (
            <>
              {showProjects ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </>
          )}
        </button>

        {/* show projects */}

        {/* links for priority */}
        <button
          onClick={() => setShowPriority((prev) => !prev)}
          className={`flex w-full items-center transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 ${isSidebarCollapsed ? "justify-center px-3 py-3" : "justify-between px-8 py-3"}`}
        >
          <div className="flex items-center gap-3">
            <Flag className="h-6 w-6 text-gray-800 dark:text-gray-100" />
            {!isSidebarCollapsed && (
              <span className="font-medium text-gray-800 dark:text-gray-100">
                Priority
              </span>
            )}
          </div>
          {!isSidebarCollapsed && (
            <>
              {showPriority ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </>
          )}
        </button>
        {showPriority && (
          <>
            <SidebarLink
              icon={AlertCircle}
              label="Critical"
              href="/priority/critical"
            />
            <SidebarLink
              icon={ShieldAlert}
              label="High"
              href="/priority/high"
            />
            <SidebarLink
              icon={AlertTriangle}
              label="Medium"
              href="/priority/medium"
            />
            <SidebarLink icon={AlertOctagon} label="Low" href="/priority/low" />
            <SidebarLink
              icon={Layers3}
              label="Backlog"
              href="/priority/backlog"
            />
          </>
        )}
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  // isCollapsed: boolean;
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  // isCollapsed
}: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (pathname === "/" && href === "/dashboard");
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );

  return (
    <Link href={href} className="w-full">
      <div
        className={`relative flex cursor-pointer items-center transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive ? "bg-gray-100 dark:bg-gray-600" : ""} ${isSidebarCollapsed ? "justify-center px-3 py-3" : "justify-start gap-3 px-8 py-3"}`}
      >
        {isActive && (
          <div className="absolute top-0 left-0 h-full w-[5px] bg-blue-200" />
        )}

        <Icon className="h-6 w-6 text-gray-800 dark:text-gray-100" />
        {!isSidebarCollapsed && (
          <span className="font-medium text-gray-800 dark:text-gray-100">
            {label}
          </span>
        )}
      </div>
    </Link>
  );
};

export default Sidebar;
