"use client";

import { useAppSelector } from "@/app/redux";
import Header from "@/components/Header";
import { useGetProjectsQuery } from "@/state/api";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { Calendar, Clock, ChevronDown, Search, X, ZoomIn, Navigation2 } from "lucide-react";
import Link from "next/link";

type ViewMode = "month" | "week" | "day";

const Timeline = () => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { data: projects, isLoading, isError } = useGetProjectsQuery();
  const timelineHeaderScrollRef = useRef<HTMLDivElement>(null);
  const timelineBodyScrollRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "upcoming" | "completed">("all");
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  // Get projects with valid dates
  const projectsWithDates = useMemo(() => {
    if (!projects) return [];
    return projects
      .filter((project) => project.startsAt && project.endsAt)
      .map((project) => {
        const startDate = new Date(project.startsAt);
        const endDate = new Date(project.endsAt);
        const now = new Date();

        let status: "active" | "upcoming" | "completed" = "upcoming";
        if (startDate <= now && endDate >= now) {
          status = "active";
        } else if (endDate < now) {
          status = "completed";
        }

        return {
          ...project,
          startDate,
          endDate,
          name: project.title || (project as any).name || `Project ${project.id}`,
          status,
        };
      })
      .filter((p) => !isNaN(p.startDate.getTime()) && !isNaN(p.endDate.getTime()))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [projects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projectsWithDates.filter((project) => {
      if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (statusFilter !== "all" && project.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [projectsWithDates, searchQuery, statusFilter]);

  // Calculate timeline range
  const timelineRange = useMemo(() => {
    if (filteredProjects.length === 0) return null;

    const dates = filteredProjects.flatMap((p) => [p.startDate, p.endDate]);
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    minDate.setDate(minDate.getDate() - 30);
    maxDate.setDate(maxDate.getDate() + 30);

    return { minDate, maxDate };
  }, [filteredProjects]);

  // Calculate minimum timeline width based on date range
  const timelineMinWidth = useMemo(() => {
    if (!timelineRange) return 1000;
    const totalDays = (timelineRange.maxDate.getTime() - timelineRange.minDate.getTime()) / (1000 * 60 * 60 * 24);
    // Each day gets at least 4px of width for better visibility
    const calculatedWidth = Math.max(totalDays * 4, 1200);
    return Math.min(calculatedWidth, 5000); // Cap at 5000px for performance
  }, [timelineRange]);

  // Status-based color palette
  const getProjectColor = (project: typeof filteredProjects[0]) => {
    if (project.status === "active") {
      return "#10b981"; // Green
    } else if (project.status === "upcoming") {
      return "#3b82f6"; // Blue
    } else if (project.status === "completed") {
      return "#64748b"; // Gray
    }
    return "#6366f1";
  };

  // Calculate position on timeline
  const getPosition = (date: Date) => {
    if (!timelineRange) return 0;
    const totalDays = (timelineRange.maxDate.getTime() - timelineRange.minDate.getTime()) / (1000 * 60 * 60 * 24);
    const daysFromStart = (date.getTime() - timelineRange.minDate.getTime()) / (1000 * 60 * 60 * 24);
    return (daysFromStart / totalDays) * 100;
  };

  // Generate date markers
  const dateMarkers = useMemo(() => {
    if (!timelineRange) return [];

    const markers: { date: Date; label: string }[] = [];
    const current = new Date(timelineRange.minDate);
    const max = timelineRange.maxDate;

    while (current <= max) {
      if (viewMode === "month") {
        if (current.getDate() === 1) {
          markers.push({
            date: new Date(current),
            label: current.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          });
        }
        current.setMonth(current.getMonth() + 1);
        current.setDate(1);
      } else if (viewMode === "week") {
        const dayOfWeek = current.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        current.setDate(current.getDate() - daysToMonday);
        markers.push({
          date: new Date(current),
          label: current.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        });
        current.setDate(current.getDate() + 7);
      } else {
        markers.push({
          date: new Date(current),
          label: current.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        });
        current.setDate(current.getDate() + 7);
      }
    }

    return markers;
  }, [timelineRange, viewMode]);

  // Format date for display (compact)
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format date for tooltip (full)
  const formatDateFull = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Sync horizontal scrolling between header and body
  useEffect(() => {
    const headerScroll = timelineHeaderScrollRef.current;
    const bodyScroll = timelineBodyScrollRef.current;

    if (!headerScroll || !bodyScroll) return;

    let isScrolling = false;

    const handleHeaderScroll = () => {
      if (isScrolling) return;
      isScrolling = true;
      bodyScroll.scrollLeft = headerScroll.scrollLeft;
      requestAnimationFrame(() => {
        isScrolling = false;
      });
    };

    const handleBodyScroll = () => {
      if (isScrolling) return;
      isScrolling = true;
      headerScroll.scrollLeft = bodyScroll.scrollLeft;
      requestAnimationFrame(() => {
        isScrolling = false;
      });
    };

    headerScroll.addEventListener("scroll", handleHeaderScroll);
    bodyScroll.addEventListener("scroll", handleBodyScroll);

    return () => {
      headerScroll.removeEventListener("scroll", handleHeaderScroll);
      bodyScroll.removeEventListener("scroll", handleBodyScroll);
    };
  }, [filteredProjects]);

  // Scroll to today
  const scrollToToday = () => {
    if (!timelineRange || !timelineBodyScrollRef.current) return;
    const today = new Date();
    if (today >= timelineRange.minDate && today <= timelineRange.maxDate) {
      const position = getPosition(today);
      const timelineWidth = timelineBodyScrollRef.current.scrollWidth;
      const scrollPosition = (position / 100) * timelineWidth - timelineBodyScrollRef.current.clientWidth / 2;
      timelineBodyScrollRef.current.scrollLeft = scrollPosition;
    }
  };

  // Zoom to fit all projects
  const zoomToFit = () => {
    if (!timelineRange || !timelineBodyScrollRef.current || filteredProjects.length === 0) return;

    const dates = filteredProjects.flatMap((p) => [p.startDate, p.endDate]);
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    const startPos = getPosition(minDate);
    const timelineWidth = timelineBodyScrollRef.current.scrollWidth;
    const padding = 0.1;
    const scrollPosition = Math.max(0, (startPos / 100) * timelineWidth - padding * timelineBodyScrollRef.current.clientWidth);
    timelineBodyScrollRef.current.scrollLeft = scrollPosition;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-gray-400"></div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading timeline...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900/20 dark:bg-red-900/10">
          <h3 className="mb-2 text-base font-medium text-red-800 dark:text-red-400">
            Error Loading Timeline
          </h3>
          <p className="text-sm text-red-600 dark:text-red-500">
            An error occurred while fetching projects.
          </p>
        </div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Calendar className="h-10 w-10 text-gray-300 dark:text-gray-600" />
          <div className="text-center">
            <h3 className="mb-1 text-base font-medium text-gray-900 dark:text-white">
              No Projects Found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create a project to see it on the timeline.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (projectsWithDates.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Clock className="h-10 w-10 text-gray-300 dark:text-gray-600" />
          <div className="text-center">
            <h3 className="mb-1 text-base font-medium text-gray-900 dark:text-white">
              No Projects with Valid Dates
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Projects need start and end dates to appear on the timeline.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white p-6 dark:bg-gray-900 md:p-8 lg:p-10">
      <div className="mx-auto max-w-[1800px]">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Timeline View</h1>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                {filteredProjects.length} of {projectsWithDates.length} {projectsWithDates.length === 1 ? "project" : "projects"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] sm:flex-initial">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 transition-colors hover:border-gray-300 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:placeholder-gray-500 dark:hover:border-gray-600 dark:focus:border-gray-500 sm:w-64"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  className="appearance-none rounded-md border border-gray-200 bg-white px-3.5 py-2 pr-7 text-sm text-gray-700 transition-colors hover:border-gray-300 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:focus:border-gray-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              </div>

              {/* View Mode */}
              <div className="relative">
                <select
                  className="appearance-none rounded-md border border-gray-200 bg-white px-3.5 py-2 pr-7 text-sm text-gray-700 transition-colors hover:border-gray-300 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:focus:border-gray-500"
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as ViewMode)}
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={scrollToToday}
                  className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  title="Go to Today"
                >
                  <Navigation2 className="h-3.5 w-3.5" />
                  Today
                </button>
                <button
                  onClick={zoomToFit}
                  className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  title="Zoom to Fit"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                  Fit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Unified Gantt Chart */}
        {filteredProjects.length === 0 ? (
          <div className="flex items-center justify-center rounded-lg border border-gray-200/60 bg-white p-12 dark:border-gray-700/50 dark:bg-gray-800">
            <div className="text-center">
              <Search className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
              <h3 className="mt-4 text-base font-medium text-gray-900 dark:text-white">
                No projects found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          </div>
        ) : (
          <div
            ref={chartContainerRef}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
          >
            {/* Unified Chart Header */}
            <div className="sticky top-0 z-30 border-b border-gray-200 bg-gray-50/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95">
              <div className="flex">
                {/* Left Sidebar Header - Sticky */}
                <div className="sticky left-0 z-40 w-80 border-r border-gray-200 bg-gray-50/98 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/98">
                  <div className="grid grid-cols-3 gap-4 px-4 py-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Name
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      From
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      To
                    </div>
                  </div>
                </div>

                {/* Timeline Header - Scrolls with content */}
                <div
                  className="flex-1 overflow-x-auto"
                  ref={timelineHeaderScrollRef}
                  style={{
                    scrollbarWidth: "thin",
                    WebkitOverflowScrolling: "touch"
                  }}
                >
                  <div className="relative h-12" style={{ minWidth: `${timelineMinWidth}px` }}>
                    {dateMarkers.map((marker, index) => (
                      <div
                        key={index}
                        className="absolute top-0 flex h-full flex-col"
                        style={{ left: `${getPosition(marker.date)}%` }}
                      >
                        <div className="pt-2.5">
                          <div className="whitespace-nowrap px-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                            {marker.label}
                          </div>
                        </div>
                        <div className="mt-auto h-full w-px bg-gray-300/60 dark:bg-gray-600/40"></div>
                      </div>
                    ))}
                    {/* Today indicator */}
                    {timelineRange && (
                      (() => {
                        const today = new Date();
                        if (today >= timelineRange.minDate && today <= timelineRange.maxDate) {
                          return (
                            <div
                              className="absolute top-0 z-50 flex h-full flex-col items-center"
                              style={{ left: `${getPosition(today)}%` }}
                            >
                              <div className="h-full w-0.5 bg-blue-500"></div>
                              <div className="absolute top-2.5 whitespace-nowrap rounded-md bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
                                Today
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Body */}
            <div className="relative max-h-[600px] overflow-y-auto">
              <div
                className="overflow-x-auto"
                ref={timelineBodyScrollRef}
                style={{
                  scrollbarWidth: "thin",
                  WebkitOverflowScrolling: "touch"
                }}
              >
                <div style={{ minWidth: `${timelineMinWidth}px` }}>
                {filteredProjects.map((project, index) => {
                  const startPos = getPosition(project.startDate);
                  const endPos = getPosition(project.endDate);
                  const width = Math.max(endPos - startPos, 2.5);
                  const color = getProjectColor(project);
                  const daysDuration = Math.ceil(
                    (project.endDate.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const isSingleDay = daysDuration <= 1;
                  const isHovered = hoveredProject === project.id;

                  return (
                    <div
                      key={project.id}
                      className="relative flex border-b border-gray-200/80 dark:border-gray-700/50"
                      style={{ minHeight: "64px" }}
                      onMouseEnter={() => setHoveredProject(project.id)}
                      onMouseLeave={() => setHoveredProject(null)}
                    >
                      {/* Left Sidebar - Project Info */}
                      <div
                        className={`sticky left-0 z-20 w-80 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ${
                          isHovered ? "bg-gray-50/50 dark:bg-gray-700/30" : ""
                        } transition-colors`}
                      >
                        <Link
                          href={`/projects/${project.id}`}
                          className="grid grid-cols-3 gap-4 px-4 py-4"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {project.name}
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                            {formatDate(project.startDate)}
                          </div>
                          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                            {formatDate(project.endDate)}
                          </div>
                        </Link>
                      </div>

                      {/* Timeline Area */}
                      <div className="relative flex-1">
                        {/* Grid lines that extend across */}
                        {dateMarkers.map((marker, markerIndex) => (
                          <div
                            key={markerIndex}
                            className="absolute top-0 h-full w-px bg-gray-200/40 dark:bg-gray-700/30"
                            style={{ left: `${getPosition(marker.date)}%` }}
                          />
                        ))}

                        {/* Timeline bar */}
                        <div className="absolute inset-0 flex items-center">
                          <Link
                            href={`/projects/${project.id}`}
                            className={`absolute flex items-center rounded px-3 py-2 transition-all ${
                              isHovered ? "z-10 scale-105 shadow-lg" : "hover:z-10 hover:scale-[1.02] hover:shadow-md"
                            }`}
                            style={{
                              left: `${startPos}%`,
                              width: `${width}%`,
                              backgroundColor: color,
                              minWidth: isSingleDay ? "72px" : "140px",
                              height: "44px",
                            }}
                            title={`${project.name}\n${formatDateFull(project.startDate)} - ${formatDateFull(project.endDate)}\nDuration: ${daysDuration} day${daysDuration !== 1 ? "s" : ""}\nStatus: ${project.status}`}
                          >
                            <div className="flex w-full items-center justify-between gap-2 overflow-hidden">
                              <span className="truncate text-sm font-semibold text-white drop-shadow-sm">
                                {project.name}
                              </span>
                              {!isSingleDay && width > 12 && (
                                <span className="shrink-0 rounded bg-white/25 px-2 py-0.5 text-xs font-medium text-white">
                                  {daysDuration}d
                                </span>
                              )}
                              {isSingleDay && (
                                <div className="shrink-0 h-2 w-2 rounded-full bg-white/90 shadow-sm"></div>
                              )}
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
