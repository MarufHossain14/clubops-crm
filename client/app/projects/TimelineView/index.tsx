import { useAppSelector } from "@/app/redux";
import { useGetTasksQuery } from "@/state/api";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { Calendar, ChevronDown, Plus, Clock, AlertCircle } from "lucide-react";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

type TaskTypeItems = "task" | "milestone" | "project";

const Timeline = ({ id, setIsModalNewTaskOpen }: Props) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const eventId = Number(id);
  const ganttContainerRef = useRef<HTMLDivElement>(null);
  const {
    data: tasks,
    error,
    isLoading,
  } = useGetTasksQuery(
    { eventId },
    { skip: isNaN(eventId) || eventId <= 0 }
  );

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  const ganttTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    const now = new Date();
    const colors = [
      { bg: "#3b82f6", progress: "#60a5fa" },
      { bg: "#10b981", progress: "#34d399" },
      { bg: "#f59e0b", progress: "#fbbf24" },
      { bg: "#ef4444", progress: "#f87171" },
      { bg: "#8b5cf6", progress: "#a78bfa" },
    ];

    return tasks
      .filter((task) => {
        // Use dueAt or dueDate (backend provides both)
        const dueDate = (task as any).dueDate || task.dueAt;
        return !!dueDate;
      })
      .map((task, index) => {
        // Backend provides dueDate, but we'll fall back to dueAt
        const dueDate = (task as any).dueDate || task.dueAt;
        const startDateField = (task as any).startDate;

        if (!dueDate) return null;

        const endDateRaw = new Date(dueDate);
        // If task has startDate, use it, otherwise estimate from dueDate (7 days before)
        const startDateRaw = startDateField
          ? new Date(startDateField)
          : new Date(endDateRaw.getTime() - 7 * 24 * 60 * 60 * 1000);

        if (isNaN(startDateRaw.getTime()) || isNaN(endDateRaw.getTime())) {
          return null;
        }

        // Normalize dates: start at beginning of day, end at end of day
        const startDate = new Date(startDateRaw);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(endDateRaw);
        // Check if events are on the same calendar day
        const isSameDay =
          startDateRaw.getFullYear() === endDateRaw.getFullYear() &&
          startDateRaw.getMonth() === endDateRaw.getMonth() &&
          startDateRaw.getDate() === endDateRaw.getDate();

        if (isSameDay) {
          // Single day event: extend to end of day for better visibility
          endDate.setTime(startDate.getTime());
          endDate.setHours(23, 59, 59, 999);
        } else {
          // Multi-day event: normalize end date to end of day
          endDate.setHours(23, 59, 59, 999);
        }

        // Ensure minimum duration for single-day events to be visible in the chart
        const minDurationForSingleDay = 24 * 60 * 60 * 1000; // 24 hours (full day)
        if (isSameDay && (endDate.getTime() - startDate.getTime() < minDurationForSingleDay)) {
          endDate.setTime(startDate.getTime() + minDurationForSingleDay - 1);
        }

        const colorSet = colors[index % colors.length];
        const duration = endDate.getTime() - startDate.getTime();
        const elapsed = now.getTime() - startDate.getTime();
        const progress = duration > 0
          ? Math.min(Math.max((elapsed / duration) * 100, 0), 100)
          : 0;

        return {
          start: startDate,
          end: endDate,
          name: task.title,
          id: `Task-${task.id}`,
          type: "task" as TaskTypeItems,
          progress: Math.round(progress),
          isDisabled: false,
          styles: {
            progressColor: isDarkMode ? colorSet.progress : colorSet.progress,
            progressSelectedColor: isDarkMode ? colorSet.bg : colorSet.bg,
            backgroundColor: isDarkMode ? colorSet.bg : colorSet.bg,
          },
        };
      })
      .filter((task) => task !== null) as any[];
  }, [tasks, isDarkMode]);

  // Aggressive dark mode override for Gantt chart
  useEffect(() => {
    if (!isDarkMode) return;

    let intervalId: NodeJS.Timeout;
    let rafId: number;

    const overrideGanttStyles = () => {
      const container = ganttContainerRef.current;
      if (!container) return;

      // Force ALL elements to dark backgrounds
      const allElements = container.querySelectorAll('*');
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (!htmlEl) return;

        // Get computed style
        const computedStyle = window.getComputedStyle(htmlEl);
        const bgColor = computedStyle.backgroundColor;
        const bgImage = computedStyle.backgroundImage;
        const color = computedStyle.color;

        // Extract RGB values from computed color
        const rgbMatch = bgColor.match(/\d+/g);
        if (rgbMatch && rgbMatch.length >= 3) {
          const r = parseInt(rgbMatch[0]);
          const g = parseInt(rgbMatch[1]);
          const b = parseInt(rgbMatch[2]);

          // If it's white or very light (RGB > 240), force dark
          if (r > 240 && g > 240 && b > 240) {
            htmlEl.style.setProperty('background-color', '#1f2937', 'important');
            htmlEl.style.setProperty('background', '#1f2937', 'important');
          }
        }

        // Force dark on any element with white in style attribute
        if (
          htmlEl.style.backgroundColor && (
            htmlEl.style.backgroundColor.includes('255') ||
            htmlEl.style.backgroundColor === 'white' ||
            htmlEl.style.backgroundColor === '#fff' ||
            htmlEl.style.backgroundColor === '#ffffff' ||
            htmlEl.style.backgroundColor === 'rgb(255, 255, 255)'
          )
        ) {
          htmlEl.style.setProperty('background-color', '#1f2937', 'important');
        }

        if (
          htmlEl.style.background && (
            htmlEl.style.background.includes('255') ||
            htmlEl.style.background.includes('white') ||
            htmlEl.style.background.includes('#fff')
          )
        ) {
          htmlEl.style.setProperty('background', '#1f2937', 'important');
        }

        // Force light text on dark backgrounds
        const textRgbMatch = color.match(/\d+/g);
        if (textRgbMatch && textRgbMatch.length >= 3) {
          const r = parseInt(textRgbMatch[0]);
          const g = parseInt(textRgbMatch[1]);
          const b = parseInt(textRgbMatch[2]);

          // If text is very dark (RGB < 50), make it light
          if (r < 50 && g < 50 && b < 50) {
            htmlEl.style.setProperty('color', '#e5e7eb', 'important');
          }
        }
      });

      // Aggressively target ALL tables and cells
      const tables = container.querySelectorAll('table, .gantt-table, [class*="table"]');
      tables.forEach((table) => {
        const htmlTable = table as HTMLElement;
        htmlTable.style.setProperty('background-color', '#1f2937', 'important');
        htmlTable.style.setProperty('background', '#1f2937', 'important');
        htmlTable.style.setProperty('color', '#e5e7eb', 'important');

        const allCells = htmlTable.querySelectorAll('td, th, *');
        allCells.forEach((cell) => {
          const htmlCell = cell as HTMLElement;
          htmlCell.style.setProperty('background-color', '#1f2937', 'important');
          htmlCell.style.setProperty('background', '#1f2937', 'important');
          htmlCell.style.setProperty('color', '#e5e7eb', 'important');
          htmlCell.style.setProperty('border-color', '#374151', 'important');
        });
      });

      // Target headers specifically
      const headers = container.querySelectorAll('thead, thead *, [class*="header"]');
      headers.forEach((header) => {
        const htmlHeader = header as HTMLElement;
        htmlHeader.style.setProperty('background-color', '#111827', 'important');
        htmlHeader.style.setProperty('background', '#111827', 'important');
        htmlHeader.style.setProperty('color', '#e5e7eb', 'important');
      });

      // Target all divs in the container
      const divs = container.querySelectorAll('div, [class*="gantt"]');
      divs.forEach((div) => {
        const htmlDiv = div as HTMLElement;
        const computedBg = window.getComputedStyle(htmlDiv).backgroundColor;
        const rgbMatch = computedBg.match(/\d+/g);
        if (rgbMatch && rgbMatch.length >= 3) {
          const r = parseInt(rgbMatch[0]);
          const g = parseInt(rgbMatch[1]);
          const b = parseInt(rgbMatch[2]);
          if (r > 200 && g > 200 && b > 200) {
            htmlDiv.style.setProperty('background-color', '#1f2937', 'important');
            htmlDiv.style.setProperty('background', '#1f2937', 'important');
          }
        }
      });

      // Specifically target divs with hash-based classes (like _3lLk3) and title attributes
      const taskListDivs = container.querySelectorAll('div[title], div[class*="_"][style*="280px"], div[style*="min-width: 280px"]');
      taskListDivs.forEach((div) => {
        const htmlDiv = div as HTMLElement;
        htmlDiv.style.setProperty('background-color', '#1f2937', 'important');
        htmlDiv.style.setProperty('color', '#e5e7eb', 'important');
      });
    };

    // Run immediately
    overrideGanttStyles();

    // Run after a short delay
    const timeoutId = setTimeout(overrideGanttStyles, 100);
    const timeoutId2 = setTimeout(overrideGanttStyles, 300);
    const timeoutId3 = setTimeout(overrideGanttStyles, 500);

    // Run continuously using requestAnimationFrame
    const runContinuously = () => {
      overrideGanttStyles();
      if (isDarkMode) {
        rafId = requestAnimationFrame(runContinuously);
      }
    };
    rafId = requestAnimationFrame(runContinuously);

    // Also run on an interval as backup
    intervalId = setInterval(overrideGanttStyles, 500);

    // Run on mutations
    const observer = new MutationObserver(() => {
      overrideGanttStyles();
    });

    if (ganttContainerRef.current) {
      observer.observe(ganttContainerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'bgcolor']
      });
    }

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
      clearInterval(intervalId);
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [isDarkMode, ganttTasks.length, displayOptions.viewMode]);

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <div className="text-lg text-gray-600 dark:text-gray-400">Loading timeline...</div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Error fetching tasks:", error);
    const errorMessage = error && "status" in error ? `Status: ${error.status}` : "Failed to fetch tasks";
    const errorData = error && "data" in error ? error.data : null;
    let errorDataString = "";
    if (errorData) {
      if (typeof errorData === "string") {
        errorDataString = errorData;
      } else {
        try {
          errorDataString = JSON.stringify(errorData);
        } catch {
          errorDataString = "Error details unavailable";
        }
      }
    }

    return (
      <div className="p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-red-800 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            Error Loading Tasks
          </h3>
          <p className="text-sm text-red-600 dark:text-red-500">
            {errorMessage}
          </p>
          {errorDataString && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-500">
              {errorDataString}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="px-4 xl:px-6">
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 dark:border-gray-700 dark:bg-gray-800">
          <Clock className="mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            No Tasks Found
          </h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            This project doesn't have any tasks yet. Create your first task to see it on the timeline.
          </p>
          <button
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create Task
          </button>
        </div>
      </div>
    );
  }

  if (ganttTasks.length === 0) {
    return (
      <div className="px-4 xl:px-6">
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 dark:border-gray-700 dark:bg-gray-800">
          <Calendar className="mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            No Tasks with Valid Dates
          </h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Tasks need due dates to appear on the timeline.
          </p>
          <button
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create Task
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 xl:px-6">
      {/* Controls Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Project Tasks Timeline
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"} in this project
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              className="focus:shadow-outline block w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 text-sm leading-tight shadow-sm transition-colors hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:border-gray-500 dark:focus:border-blue-400 sm:w-48 [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-gray-700 dark:[&>option]:text-white"
              value={displayOptions.viewMode}
              onChange={handleViewModeChange}
            >
              <option value={ViewMode.Day}>Day View</option>
              <option value={ViewMode.Week}>Week View</option>
              <option value={ViewMode.Month}>Month View</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>
          <button
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div
          className={`overflow-x-auto ${isDarkMode ? 'dark' : ''}`}
          ref={ganttContainerRef}
          style={isDarkMode ? { backgroundColor: '#1f2937' } : {}}
        >
          <div
            className="min-w-full gantt-wrapper"
            style={{
              minHeight: "500px",
              backgroundColor: isDarkMode ? '#1f2937' : 'transparent',
              color: isDarkMode ? '#e5e7eb' : 'inherit'
            }}
          >
            <Gantt
              tasks={ganttTasks}
              viewMode={displayOptions.viewMode}
              locale={displayOptions.locale}
              columnWidth={
                displayOptions.viewMode === ViewMode.Month
                  ? 250
                  : displayOptions.viewMode === ViewMode.Week
                    ? 180
                    : 120
              }
              listCellWidth="280px"
              rowHeight={65}
              ganttHeight={Math.max(600, ganttTasks.length * 65 + 150)}
              projectBackgroundColor={isDarkMode ? "#374151" : "#4b5563"}
              projectProgressColor={isDarkMode ? "#60a5fa" : "#3b82f6"}
              projectProgressSelectedColor={isDarkMode ? "#3b82f6" : "#2563eb"}
              arrowColor={isDarkMode ? "#9ca3af" : "#6b7280"}
              arrowIndent={20}
              todayColor={isDarkMode ? "rgba(59, 130, 246, 0.2)" : "rgba(96, 165, 250, 0.15)"}
              fontSize="14"
              fontFamily="system-ui, -apple-system, sans-serif"
              rtl={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
