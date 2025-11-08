"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import { useGetProjectsQuery } from "@/state/api";
import { useUser, UserButton } from '@clerk/nextjs';
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Home,
  Layers3,
  LockIcon,
  LucideIcon,
  Search,
  Settings,
  ShieldAlert,
  User,
  Users,
  X,
  Folder,
  Menu,
  Flag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect } from "react";

const Sidebar = () => {
  const [showProjects, setShowProjects] = useState(true);
  const [showPriority, setShowPriority] = useState(true);
  const [showAllProjects, setShowAllProjects] = useState(false);

  const { data: projects } = useGetProjectsQuery();
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const { user } = useUser();

  // Limit projects shown initially
  const MAX_INITIAL_PROJECTS = 5;
  const displayedProjects = useMemo(() => {
    if (!projects) return [];
    return showAllProjects ? projects : projects.slice(0, MAX_INITIAL_PROJECTS);
  }, [projects, showAllProjects]);

  const hasMoreProjects = projects && projects.length > MAX_INITIAL_PROJECTS;

  // Determine if we're on mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sidebarClassNames = `fixed left-0 top-0 flex flex-col h-screen justify-between shadow-xl
    transition-all duration-300 z-40 dark:bg-black bg-white
    ${isSidebarCollapsed
      ? isMobile
        ? "w-0 -translate-x-full hidden"
        : "w-16 translate-x-0 flex"
      : "w-64 translate-x-0"
    }
    overflow-hidden
  `;

  return (
    <>
      {/* Mobile Backdrop */}
      {!isSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => dispatch(setIsSidebarCollapsed(true))}
          aria-hidden="true"
        />
      )}
      <div className={sidebarClassNames}>
        <div className="flex h-full w-full flex-col overflow-hidden">
        {/* TOP LOGO */}
        <div className={`z-50 flex min-h-[56px] shrink-0 items-center bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 ${isSidebarCollapsed && !isMobile ? 'justify-center px-2' : 'justify-between px-4 md:px-6'} pt-3`}>
          {!isSidebarCollapsed || (isSidebarCollapsed && !isMobile) ? (
            <>
              {!isSidebarCollapsed && (
                <div className="text-xl font-bold text-gray-800 dark:text-white">
                  EntryStack
                </div>
              )}
              <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                onClick={() => {
                  dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
                }}
                aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isSidebarCollapsed && !isMobile ? (
                  <Menu className="h-5 w-5 text-gray-800 dark:text-white" />
                ) : (
                  <X className="h-5 w-5 text-gray-800 dark:text-white" />
                )}
              </button>
            </>
          ) : null}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* TEAM */}
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3 border-b border-gray-200 px-4 md:px-6 py-3 dark:border-gray-800">
              <Image
                src="/logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold tracking-wide dark:text-gray-200 truncate">
                  CampOps
                </h3>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <LockIcon className="h-3 w-3 text-gray-500 dark:text-gray-400 shrink-0" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Private</p>
                </div>
              </div>
            </div>
          )}

          {/* NAVBAR LINKS */}
          <nav className="z-10 w-full py-2 flex flex-col items-center md:items-stretch">
            <SidebarLink icon={Home} label="Home" href="/" isCollapsed={isSidebarCollapsed} />
            <SidebarLink icon={Briefcase} label="Timeline" href="/timeline" isCollapsed={isSidebarCollapsed} />
            <SidebarLink icon={Search} label="Search" href="/search" isCollapsed={isSidebarCollapsed} />
            <SidebarLink icon={Settings} label="Settings" href="/settings" isCollapsed={isSidebarCollapsed} />
            <SidebarLink icon={User} label="Users" href="/users" isCollapsed={isSidebarCollapsed} />
            <SidebarLink icon={Users} label="Teams" href="/teams" isCollapsed={isSidebarCollapsed} />
          </nav>

          {/* PROJECTS SECTION - Collapsed Icon */}
          {isSidebarCollapsed && !isMobile && (
            <div className="border-t border-gray-200 dark:border-gray-800 mt-2 pt-2">
              <button
                onClick={() => {
                  dispatch(setIsSidebarCollapsed(false));
                  setShowProjects(true);
                }}
                className="w-full flex justify-center"
                title="Projects"
              >
                <div className="relative flex cursor-pointer items-center justify-center w-12 h-12 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                  <Folder className="h-5 w-5 text-gray-800 dark:text-gray-100" />
                  {projects && projects.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-medium text-white">
                      {projects.length > 9 ? '9+' : projects.length}
                    </span>
                  )}
                </div>
              </button>
            </div>
          )}

          {/* PROJECTS SECTION */}
          {!isSidebarCollapsed && (
            <div className="border-t border-gray-200 dark:border-gray-800 mt-2">
              <button
                onClick={() => setShowProjects((prev) => !prev)}
                className="flex w-full items-center justify-between px-4 md:px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  <span>Projects</span>
                  {projects && projects.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({projects.length})
                    </span>
                  )}
                </div>
                {showProjects ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {/* PROJECTS LIST */}
              {showProjects && projects && projects.length > 0 && (
                <div className="max-h-[300px] overflow-y-auto">
                  {displayedProjects.map((project) => (
                    <ProjectLink
                      key={project.id}
                      project={project}
                      href={`/projects/${project.id}`}
                    />
                  ))}
                  {hasMoreProjects && !showAllProjects && (
                    <button
                      onClick={() => setShowAllProjects(true)}
                      className="w-full px-4 md:px-6 py-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left"
                    >
                      Show {projects.length - MAX_INITIAL_PROJECTS} more...
                    </button>
                  )}
                  {hasMoreProjects && showAllProjects && (
                    <button
                      onClick={() => setShowAllProjects(false)}
                      className="w-full px-4 md:px-6 py-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left"
                    >
                      Show less
                    </button>
                  )}
                </div>
              )}
              {showProjects && (!projects || projects.length === 0) && (
                <div className="px-4 md:px-6 py-3 text-xs text-gray-500 dark:text-gray-400">
                  No projects yet
                </div>
              )}
            </div>
          )}

          {/* PRIORITIES SECTION - Collapsed Icon */}
          {isSidebarCollapsed && !isMobile && (
            <div className="border-t border-gray-200 dark:border-gray-800 mt-2 pt-2">
              <button
                onClick={() => {
                  dispatch(setIsSidebarCollapsed(false));
                  setShowPriority(true);
                }}
                className="w-full flex justify-center"
                title="Priority"
              >
                <div className="relative flex cursor-pointer items-center justify-center w-12 h-12 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                  <Flag className="h-5 w-5 text-gray-800 dark:text-gray-100" />
                </div>
              </button>
            </div>
          )}

          {/* PRIORITIES SECTION */}
          {!isSidebarCollapsed && (
            <div className="border-t border-gray-200 dark:border-gray-800 mt-2">
              <button
                onClick={() => setShowPriority((prev) => !prev)}
                className="flex w-full items-center justify-between px-4 md:px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  <span>Priority</span>
                </div>
                {showPriority ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {showPriority && (
                <div>
                  <SidebarLink
                    icon={AlertCircle}
                    label="Urgent"
                    href="/priority/urgent"
                    isCollapsed={false}
                  />
                  <SidebarLink
                    icon={ShieldAlert}
                    label="High"
                    href="/priority/high"
                    isCollapsed={false}
                  />
                  <SidebarLink
                    icon={AlertTriangle}
                    label="Medium"
                    href="/priority/medium"
                    isCollapsed={false}
                  />
                  <SidebarLink
                    icon={AlertOctagon}
                    label="Low"
                    href="/priority/low"
                    isCollapsed={false}
                  />
                  <SidebarLink
                    icon={Layers3}
                    label="Backlog"
                    href="/priority/backlog"
                    isCollapsed={false}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom User Section - Mobile Only */}
        <div className="z-10 shrink-0 mt-auto flex w-full flex-col items-center gap-4 bg-white border-t border-gray-200 dark:border-gray-800 px-4 md:px-6 py-3 dark:bg-black md:hidden">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center shrink-0">
                {user?.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={user.firstName || "User Profile Picture"}
                    width={36}
                    height={36}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 cursor-pointer rounded-full dark:text-white" />
                )}
              </div>
              <span className="text-sm text-gray-800 dark:text-white truncate">
                {user?.firstName || user?.emailAddresses[0]?.emailAddress || "User"}
              </span>
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed?: boolean;
}

const SidebarLink = ({ href, icon: Icon, label, isCollapsed = false }: SidebarLinkProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isActive =
    pathname === href || (pathname === "/" && href === "/dashboard");

  const handleClick = (e: React.MouseEvent) => {
    // Expand sidebar when clicking an icon in collapsed mode (desktop only)
    if (isCollapsed && typeof window !== 'undefined' && window.innerWidth >= 768) {
      e.preventDefault();
      dispatch(setIsSidebarCollapsed(false));
      // Navigate after sidebar starts expanding
      setTimeout(() => {
        router.push(href);
      }, 150);
    }
  };

  if (isCollapsed) {
    return (
      <Link href={href} className="w-full flex justify-center" onClick={handleClick}>
        <div
          className={`relative flex cursor-pointer items-center justify-center w-12 h-12 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md ${
            isActive ? "bg-gray-100 dark:bg-gray-800" : ""
          }`}
          title={label}
        >
          <Icon className="h-5 w-5 text-gray-800 dark:text-gray-100" />
          {isActive && (
            <div className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r" />
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="w-full">
      <div
        className={`relative flex cursor-pointer items-center gap-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 ${
          isActive ? "bg-gray-50 dark:bg-gray-900" : ""
        } justify-start px-4 md:px-6 py-2.5`}
      >
        {isActive && (
          <div className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r" />
        )}

        <Icon className="h-5 w-5 text-gray-700 dark:text-gray-300 shrink-0" />
        <span className={`text-sm font-medium text-gray-700 dark:text-gray-300 truncate`}>
          {label}
        </span>
      </div>
    </Link>
  );
};

interface ProjectLinkProps {
  project: { id: number; title?: string; name?: string };
  href: string;
}

const ProjectLink = ({ project, href }: ProjectLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  const projectName = project.title || project.name || "Untitled Project";

  // Generate a consistent color based on project ID
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-teal-500",
  ];
  const colorIndex = project.id % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <Link href={href} className="w-full">
      <div
        className={`relative flex cursor-pointer items-center gap-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 ${
          isActive ? "bg-gray-50 dark:bg-gray-900" : ""
        } justify-start px-4 md:px-6 py-2`}
      >
        {isActive && (
          <div className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r" />
        )}

        <div
          className={`h-2 w-2 rounded-full ${bgColor} shrink-0`}
          aria-hidden="true"
        />
        <span className={`text-sm text-gray-700 dark:text-gray-300 truncate flex-1`}>
          {projectName}
        </span>
      </div>
    </Link>
  );
};

export default Sidebar;
