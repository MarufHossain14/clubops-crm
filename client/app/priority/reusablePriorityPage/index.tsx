"use client";

import { useAppSelector } from "@/app/redux";
import Header from "@/components/Header";
import ModalNewTask from "@/components/ModalNewTask";
import TaskCard from "@/components/TaskCard";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import {
  Priority,
  Task,
  useGetAllTasksQuery,
} from "@/state/api";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { format } from "date-fns";
import Image from "next/image";
import React, { useMemo, useState } from "react";

type Props = {
  priority: Priority;
};

// Get priority color scheme
const getPriorityColors = (priority: Priority) => {
  switch (priority) {
    case "Urgent":
      return {
        bg: "bg-red-50 dark:bg-red-950/20",
        border: "border-red-200 dark:border-red-900/50",
        text: "text-red-700 dark:text-red-400",
        accent: "bg-red-500",
        light: "bg-red-100 dark:bg-red-900/30",
      };
    case "High":
      return {
        bg: "bg-orange-50 dark:bg-orange-950/20",
        border: "border-orange-200 dark:border-orange-900/50",
        text: "text-orange-700 dark:text-orange-400",
        accent: "bg-orange-500",
        light: "bg-orange-100 dark:bg-orange-900/30",
      };
    case "Medium":
      return {
        bg: "bg-yellow-50 dark:bg-yellow-950/20",
        border: "border-yellow-200 dark:border-yellow-900/50",
        text: "text-yellow-700 dark:text-yellow-400",
        accent: "bg-yellow-500",
        light: "bg-yellow-100 dark:bg-yellow-900/30",
      };
    case "Low":
      return {
        bg: "bg-blue-50 dark:bg-blue-950/20",
        border: "border-blue-200 dark:border-blue-900/50",
        text: "text-blue-700 dark:text-blue-400",
        accent: "bg-blue-500",
        light: "bg-blue-100 dark:bg-blue-900/30",
      };
    default:
      return {
        bg: "bg-gray-50 dark:bg-gray-900/20",
        border: "border-gray-200 dark:border-gray-800",
        text: "text-gray-700 dark:text-gray-400",
        accent: "bg-gray-500",
        light: "bg-gray-100 dark:bg-gray-800",
      };
  }
};

const createColumns = (priority: Priority, isDarkMode: boolean): GridColDef[] => {
  const colors = getPriorityColors(priority);

  return [
    {
      field: "title",
      headerName: "Title",
      width: 250,
      flex: 1,
      renderCell: (params) => (
        <div className="font-semibold text-gray-900 dark:text-white">
          {params.value}
        </div>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      width: 300,
      flex: 1,
      renderCell: (params) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[300px]">
          {params.value || "—"}
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 160,
      renderCell: (params) => {
        const status = params.value;
        const statusColors: Record<string, string> = {
          "Completed": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
          "Work In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
          "Under Review": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
          "To Do": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        };
        return (
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
            statusColors[status] || statusColors["To Do"]
          }`}>
            {status || "—"}
          </span>
        );
      },
    },
    {
      field: "tags",
      headerName: "Tags",
      width: 150,
      renderCell: (params) => {
        const tags = params.value ? params.value.split(",").slice(0, 2) : [];
        return (
          <div className="flex gap-1">
            {tags.map((tag: string, idx: number) => (
              <span
                key={idx}
                className="rounded px-2 py-0.5 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                {tag.trim()}
              </span>
            ))}
            {params.value && params.value.split(",").length > 2 && (
              <span className="text-xs text-gray-400">+{params.value.split(",").length - 2}</span>
            )}
          </div>
        );
      },
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      width: 130,
      renderCell: (params) => {
        if (!params.value) return <span className="text-gray-400">—</span>;
        return (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {format(new Date(params.value), "MMM dd, yyyy")}
          </span>
        );
      },
    },
    {
      field: "points",
      headerName: "Points",
      width: 80,
      renderCell: (params) => (
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {params.value || "—"}
        </span>
      ),
    },
    {
      field: "assignee",
      headerName: "Assignee",
      width: 150,
      renderCell: (params) => {
        const assignee = params.value;
        if (!assignee) {
          return (
            <span className="text-gray-400 dark:text-gray-500 text-sm">Unassigned</span>
          );
        }
        return (
          <div className="flex items-center gap-2">
            {assignee.profilePictureUrl ? (
              <Image
                src={`https://pm-s3-images.s3.us-east-2.amazonaws.com/${assignee.profilePictureUrl}`}
                alt={assignee.username}
                width={24}
                height={24}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {assignee.username?.[0]?.toUpperCase() || "?"}
                </span>
              </div>
            )}
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {assignee.username}
            </span>
          </div>
        );
      },
    },
    {
      field: "eventId",
      headerName: "Project ID",
      width: 100,
      renderCell: (params) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          #{params.value}
        </span>
      ),
    },
  ];
};

const ReusablePriorityPage = ({ priority }: Props) => {
  const [view, setView] = useState("list");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  // Fetch all tasks at once (much more efficient)
  const { data: allTasks, isLoading, error: tasksError } = useGetAllTasksQuery();

  // Filter tasks by priority
  const filteredTasks = useMemo(() => {
    if (!allTasks) return [];
    return allTasks.filter((task: Task) => task.priority === priority);
  }, [allTasks, priority]);

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (tasksError) {
    console.error("Error fetching all tasks:", tasksError);
    return (
      <div className="p-4 text-red-500">
        <p>Error fetching tasks</p>
        <p className="text-sm mt-2">
          {tasksError && "status" in tasksError
            ? `Status: ${tasksError.status}`
            : "Please try again later"}
        </p>
        {tasksError && "data" in tasksError && (
          <p className="text-xs mt-1">
            {typeof tasksError.data === "string"
              ? tasksError.data
              : JSON.stringify(tasksError.data)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="m-5 p-4">

      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
      />
      <Header
        name={`${priority} Priority Tasks`}
        buttonComponent={
          <button
            className={`mr-3 rounded-lg px-4 py-2 font-semibold text-white transition-all hover:shadow-lg ${
              priority === "Urgent"
                ? "bg-red-500 hover:bg-red-600"
                : priority === "High"
                ? "bg-orange-500 hover:bg-orange-600"
                : priority === "Medium"
                ? "bg-yellow-500 hover:bg-yellow-600"
                : priority === "Low"
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-500 hover:bg-gray-600"
            }`}
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            Add Task
          </button>
        }
      />

      {/* Enhanced View Toggle */}
      <div className="mb-6 flex items-center gap-2">
        <div className={`inline-flex rounded-lg border-2 p-1 ${
          getPriorityColors(priority).border
        } ${getPriorityColors(priority).bg}`}>
          <button
            className={`px-6 py-2.5 rounded-md text-sm font-semibold transition-all ${
              view === "list"
                ? `${getPriorityColors(priority).text} ${getPriorityColors(priority).light} shadow-sm`
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
            onClick={() => setView("list")}
          >
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              List View
            </span>
          </button>
          <button
            className={`px-6 py-2.5 rounded-md text-sm font-semibold transition-all ${
              view === "table"
                ? `${getPriorityColors(priority).text} ${getPriorityColors(priority).light} shadow-sm`
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
            onClick={() => setView("table")}
          >
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Table View
            </span>
          </button>
        </div>
        <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500 dark:text-gray-400">Loading tasks...</div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 rounded-full bg-gray-100 p-6 dark:bg-gray-700">
            <svg
              className="h-12 w-12 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            No {priority} priority tasks found
          </h3>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Tasks with {priority} priority will appear here
          </p>
        </div>
      ) : view === "list" ? (
        // Enhanced List View with Priority Styling
        <div className={`overflow-hidden rounded-xl border-2 shadow-lg ${getPriorityColors(priority).border} ${getPriorityColors(priority).bg}`}>
          {/* List Header with Priority Accent */}
          <div className={`border-b-2 ${getPriorityColors(priority).border} bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-6 py-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`h-3 w-3 rounded-full ${getPriorityColors(priority).accent}`} />
                <div className="flex items-center gap-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Task Details
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Status
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Due Date
                  </div>
                </div>
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Assignee
              </div>
            </div>
          </div>

          {/* List Items with Enhanced Styling */}
          <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50 bg-white dark:bg-gray-800">
            {filteredTasks.map((task: Task, index: number) => (
              <div
                key={task.id}
                className={`group relative transition-all hover:shadow-md ${
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-800"
                    : `${getPriorityColors(priority).bg}`
                }`}
              >
                <div className={`absolute left-0 top-0 h-full w-1 ${getPriorityColors(priority).accent}`} />
                <TaskCard task={task} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Enhanced Table View with Priority Styling
        view === "table" && (
          <div className={`rounded-xl border-2 shadow-lg overflow-hidden ${getPriorityColors(priority).border} ${getPriorityColors(priority).bg}`}>
            <div className="bg-white dark:bg-gray-800 p-4">
              <DataGrid
                rows={filteredTasks}
                columns={createColumns(priority, isDarkMode)}
                checkboxSelection
                getRowId={(row) => row.id}
                className={dataGridClassNames}
                sx={{
                  ...dataGridSxStyles(isDarkMode),
                  border: "none",
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: isDarkMode ? "#1d1f21" : "#f9fafb",
                    borderBottom: `2px solid ${
                      priority === "Urgent" ? "#ef4444" :
                      priority === "High" ? "#f97316" :
                      priority === "Medium" ? "#eab308" :
                      priority === "Low" ? "#3b82f6" :
                      "#6b7280"
                    }`,
                    fontWeight: 600,
                  },
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: isDarkMode
                      ? (priority === "Urgent" ? "rgba(239, 68, 68, 0.1)" :
                         priority === "High" ? "rgba(249, 115, 22, 0.1)" :
                         priority === "Medium" ? "rgba(234, 179, 8, 0.1)" :
                         priority === "Low" ? "rgba(59, 130, 246, 0.1)" :
                         "rgba(107, 114, 128, 0.1)")
                      : (priority === "Urgent" ? "#fef2f2" :
                         priority === "High" ? "#fff7ed" :
                         priority === "Medium" ? "#fefce8" :
                         priority === "Low" ? "#eff6ff" :
                         "#f9fafb"),
                  },
                  "& .MuiDataGrid-cell": {
                    borderBottom: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
                  },
                  "& .MuiDataGrid-row": {
                    "&:nth-of-type(even)": {
                      backgroundColor: isDarkMode
                        ? (priority === "Urgent" ? "rgba(239, 68, 68, 0.05)" :
                           priority === "High" ? "rgba(249, 115, 22, 0.05)" :
                           priority === "Medium" ? "rgba(234, 179, 8, 0.05)" :
                           priority === "Low" ? "rgba(59, 130, 246, 0.05)" :
                           "rgba(107, 114, 128, 0.05)")
                        : (priority === "Urgent" ? "#fef2f2" :
                           priority === "High" ? "#fff7ed" :
                           priority === "Medium" ? "#fefce8" :
                           priority === "Low" ? "#eff6ff" :
                           "#f9fafb"),
                    },
                  },
                }}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10 },
                  },
                }}
                pageSizeOptions={[5, 10, 25, 50]}
                disableRowSelectionOnClick
              />
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default ReusablePriorityPage;
