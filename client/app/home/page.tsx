"use client";

import {
  Project,
  Task,
  useGetProjectsQuery,
  useGetTasksQuery,
  useGetSponsorsQuery,
} from "@/state/api";
import React, { useMemo } from "react";
import { useAppSelector } from "../redux";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Header from "@/components/Header";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  Folder,
  TrendingUp,
  Calendar,
  DollarSign,
  Building2,
  FolderOpen,
  ListTodo,
  CheckCircle,
  Activity,
} from "lucide-react";
import { Skeleton, SkeletonCard } from "@/components/Skeleton";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const HomePage = () => {
  const {
    data: projects,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
    error: projectsError,
  } = useGetProjectsQuery();

  const {
    data: sponsors,
    isLoading: isSponsorsLoading,
  } = useGetSponsorsQuery({});

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // Get tasks from the first project if available
  const firstProjectId = projects && projects.length > 0 ? projects[0].id : null;
  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useGetTasksQuery(
    { eventId: firstProjectId || 1 },
    { skip: !firstProjectId }
  );

  // Calculate statistics
  const stats = useMemo(() => {
    if (!projects) return null;

    const totalProjects = projects.length;
    const totalTasks = tasks?.length || 0;

    const taskStatusCount = (tasks || []).reduce(
      (acc: Record<string, number>, task: Task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      },
      {}
    );

    const completedTasks = taskStatusCount["Completed"] || 0;
    const inProgressTasks = (taskStatusCount["Work In Progress"] || 0) + (taskStatusCount["In Progress"] || 0);
    const todoTasks = taskStatusCount["To Do"] || 0;

    // Count projects by status
    const projectStatusCount = projects.reduce(
      (acc: Record<string, number>, project: Project) => {
        const status = project.status || "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {}
    );

    // Upcoming projects (starting in next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingProjects = projects.filter((project) => {
      if (!project.startsAt) return false;
      const startDate = new Date(project.startsAt);
      return startDate >= now && startDate <= thirtyDaysFromNow;
    }).length;

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      projectStatusCount,
      upcomingProjects,
    };
  }, [projects, tasks]);

  // Prepare chart data
  const taskDistribution = useMemo(() => {
    if (!tasks) return [];
    const statusCount = tasks.reduce(
      (acc: Record<string, number>, task: Task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      },
      {}
    );
    return Object.keys(statusCount).map((key) => ({
      name: key,
      count: statusCount[key],
    }));
  }, [tasks]);

  const projectStatus = useMemo(() => {
    if (!projects) return [];
    const statusCount = projects.reduce(
      (acc: Record<string, number>, project: Project) => {
        const status = project.status || "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {}
    );
    return Object.keys(statusCount).map((key) => ({
      name: key,
      count: statusCount[key],
    }));
  }, [projects]);

  // Recent tasks (last 5)
  const recentTasks = useMemo(() => {
    if (!tasks) return [];
    return [...tasks]
      .sort((a, b) => {
        const dateA = a.dueAt ? new Date(a.dueAt).getTime() : 0;
        const dateB = b.dueAt ? new Date(b.dueAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [tasks]);

  const taskColumns: GridColDef[] = [
    {
      field: "title",
      headerName: "Title",
      width: 250,
      renderCell: (params) => (
        <Link
          href={`/projects/${params.row.eventId}`}
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          {params.value}
        </Link>
      ),
    },
    { field: "status", headerName: "Status", width: 150 },
    {
      field: "dueAt",
      headerName: "Due Date",
      width: 150,
      renderCell: (params) =>
        params.value
          ? new Date(params.value).toLocaleDateString()
          : "No due date",
    },
  ];

  const chartColors = isDarkMode
    ? {
        bar: "#3b82f6",
        barGrid: "#374151",
        pieFill: "#3b82f6",
        text: "#e5e7eb",
        background: "#1f2937",
      }
    : {
        bar: "#3b82f6",
        barGrid: "#e5e7eb",
        pieFill: "#3b82f6",
        text: "#374151",
        background: "#ffffff",
      };

  if (isProjectsLoading) {
    return (
      <div className="px-4 pb-8 xl:px-6">
        <div className="pt-5">
          <Skeleton variant="text" height={32} width="200px" className="mb-6" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <Skeleton variant="text" height={16} width="60%" className="mb-2" />
                <Skeleton variant="text" height={32} width="40%" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  if (isProjectsError || !projects) {
    // Extract error message for better debugging
    let errorMessage = 'Failed to load projects';
    let errorStatus = '';
    let errorDetails = '';

    if (projectsError) {
      if (typeof projectsError === 'object' && projectsError !== null) {
        if ('status' in projectsError) {
          errorStatus = String(projectsError.status);
          // Handle different error statuses
          if (projectsError.status === 'FETCH_ERROR' || projectsError.status === 'PARSING_ERROR') {
            errorMessage = 'Cannot connect to the backend server. Please make sure the server is running on port 8000.';
          } else if (typeof projectsError.status === 'number') {
            errorStatus = `HTTP ${projectsError.status}`;
            errorMessage = `Server returned error ${projectsError.status}`;
          }
        }

        if ('data' in projectsError) {
          if (typeof projectsError.data === 'string') {
            errorDetails = projectsError.data;
          } else if (projectsError.data && typeof projectsError.data === 'object') {
            errorDetails = JSON.stringify(projectsError.data, null, 2);
          }
        } else if ('error' in projectsError) {
          errorDetails = String(projectsError.error);
        } else {
          errorDetails = JSON.stringify(projectsError, null, 2);
        }
      } else if (typeof projectsError === 'string') {
        errorMessage = projectsError;
      }
    } else if (!projects) {
      errorMessage = 'No projects data available';
    }

    // Check if it's likely a connection error
    const isConnectionError = errorStatus === 'FETCH_ERROR' ||
                              errorMessage.includes('Failed to fetch') ||
                              errorMessage.includes('NetworkError') ||
                              (!errorStatus && !errorDetails);

    return (
      <div className="p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
          <h3 className="mb-2 font-semibold text-red-800 dark:text-red-400">
            Error fetching data
          </h3>
          <p className="mb-2 text-sm text-red-600 dark:text-red-500">
            {errorMessage}
          </p>

          {isConnectionError && (
            <div className="mt-3 rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                💡 Troubleshooting Steps:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-yellow-700 dark:text-yellow-300">
                <li>Make sure the backend server is running</li>
                <li>Start the server with: <code className="bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">cd server && npm run dev</code></li>
                <li>Verify the server is accessible at: <code className="bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">http://localhost:8000</code></li>
                <li>Check that your database is running and configured</li>
              </ol>
            </div>
          )}

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-3" open={isConnectionError}>
              <summary className="cursor-pointer text-xs font-medium text-red-700 dark:text-red-300 mb-2">
                Error details (dev only) {errorStatus && `- ${errorStatus}`}
              </summary>
              <div className="mt-2 space-y-2">
                <div className="rounded bg-red-100 p-2 text-xs text-red-900 dark:bg-red-900/30 dark:text-red-200">
                  <div className="font-semibold mb-1">API Configuration:</div>
                  <div>Base URL: {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}</div>
                </div>
                {errorDetails && (
                  <pre className="mt-2 overflow-auto rounded bg-red-100 p-2 text-xs text-red-900 dark:bg-red-900/30 dark:text-red-200 max-h-48">
                    {errorDetails}
                  </pre>
                )}
                {projectsError && typeof projectsError === 'object' && (
                  <pre className="mt-2 overflow-auto rounded bg-red-100 p-2 text-xs text-red-900 dark:bg-red-900/30 dark:text-red-200 max-h-48">
                    {JSON.stringify(projectsError, null, 2)}
                  </pre>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-8">
      <Header name="Dashboard" />

      {/* Statistics Cards */}
      {stats && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={<FolderOpen className="h-5 w-5" />}
            color="blue"
            isDarkMode={isDarkMode}
          />
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={<ListTodo className="h-5 w-5" />}
            color="purple"
            isDarkMode={isDarkMode}
          />
          <StatCard
            title="Completed"
            value={stats.completedTasks}
            icon={<CheckCircle className="h-5 w-5" />}
            color="green"
            isDarkMode={isDarkMode}
          />
          <StatCard
            title="In Progress"
            value={stats.inProgressTasks}
            icon={<Activity className="h-5 w-5" />}
            color="orange"
            isDarkMode={isDarkMode}
          />
        </div>
      )}

      {/* Charts Section */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Task Status Distribution */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-black">
          <h3 className="mb-4 text-base font-medium text-gray-900 dark:text-gray-100">
            Task Status Distribution
          </h3>
          {taskDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskDistribution}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartColors.barGrid}
                />
                <XAxis
                  dataKey="name"
                  stroke={chartColors.text}
                  tick={{ fill: chartColors.text }}
                />
                <YAxis stroke={chartColors.text} tick={{ fill: chartColors.text }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.background,
                    border: `1px solid ${chartColors.barGrid}`,
                    borderRadius: "6px",
                    color: chartColors.text,
                  }}
                />
                <Bar dataKey="count" fill={chartColors.bar} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-gray-500 dark:text-gray-400">
              No tasks available
            </div>
          )}
        </div>

        {/* Project Status */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-black">
          <h3 className="mb-4 text-base font-medium text-gray-900 dark:text-gray-100">
            Project Status
          </h3>
          {projectStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="count"
                  data={projectStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill={chartColors.pieFill}
                >
                  {projectStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.background,
                    border: `1px solid ${chartColors.barGrid}`,
                    borderRadius: "6px",
                    color: chartColors.text,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-gray-500 dark:text-gray-400">
              No projects available
            </div>
          )}
        </div>
      </div>

      {/* Recent Tasks and Tasks Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Tasks */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-black">
            <h3 className="mb-4 text-base font-medium text-gray-900 dark:text-gray-100">
              Recent Tasks
            </h3>
            {recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/projects/${task.eventId}`}
                    className="block rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-gray-300 hover:bg-gray-50/50 dark:border-gray-800 dark:bg-black dark:hover:border-gray-700 dark:hover:bg-gray-900/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {task.status}
                        </p>
                      </div>
                    </div>
                    {task.dueAt && (
                      <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(task.dueAt).toLocaleDateString()}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No recent tasks
              </div>
            )}
          </div>
        </div>

        {/* Tasks Table */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-black">
            <h3 className="mb-4 text-base font-medium text-gray-900 dark:text-gray-100">
              All Tasks
            </h3>
            {tasks && tasks.length > 0 ? (
              <div style={{ height: 400, width: "100%" }}>
                <DataGrid
                  rows={tasks}
                  columns={taskColumns}
                  checkboxSelection
                  loading={tasksLoading}
                  getRowClassName={() => "data-grid-row"}
                  getCellClassName={() => "data-grid-cell"}
                  className={dataGridClassNames}
                  sx={dataGridSxStyles(isDarkMode)}
                  pageSizeOptions={[5, 10, 25]}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 10 },
                    },
                  }}
                />
              </div>
            ) : (
              <div className="py-12 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {firstProjectId
                    ? "No tasks found for this project"
                    : "Select a project to view tasks"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sponsors Section */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Sponsors
          </h2>
          {sponsors && sponsors.length > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-500">
              {sponsors.length} sponsor{sponsors.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {isSponsorsLoading ? (
          <div className="flex h-32 items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
            <div className="text-sm text-gray-500 dark:text-gray-500">Loading sponsors...</div>
          </div>
        ) : sponsors && sponsors.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sponsors.map((sponsor) => {
              const totalPledged = sponsor.pledged || 0;
              const totalReceived = sponsor.received || 0;
              const completionPercentage =
                totalPledged > 0 ? (totalReceived / totalPledged) * 100 : 0;

              return (
                <div
                  key={sponsor.id}
                  className="rounded-lg border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300 dark:border-gray-800 dark:bg-black dark:hover:border-gray-700"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-1.5 text-base font-medium text-gray-900 dark:text-gray-100">
                        {sponsor.name}
                      </h3>
                      {sponsor.tier && (
                        <span className="inline-flex items-center rounded-md border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-600 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400">
                          {sponsor.tier}
                        </span>
                      )}
                    </div>
                    <Building2 className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Stage</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {sponsor.stage}
                        </span>
                      </div>
                    </div>

                    {totalPledged > 0 && (
                      <div>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Pledged</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ${totalPledged.toLocaleString()}
                          </span>
                        </div>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Received</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            ${totalReceived.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-full bg-green-500 transition-all dark:bg-green-600"
                            style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {completionPercentage.toFixed(0)}% complete
                        </div>
                      </div>
                    )}

                    {sponsor.contactEmail && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {sponsor.contactEmail}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-black">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-100">
              No Sponsors
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
              No sponsors have been added yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "purple" | "green" | "orange" | "red";
  isDarkMode: boolean;
}

const StatCard = ({ title, value, icon, color, isDarkMode }: StatCardProps) => {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    purple: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
    green: "bg-green-500/10 text-green-600 dark:bg-green-500/10 dark:text-green-400",
    orange: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
    red: "bg-red-500/10 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-black">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-500">
            {title}
          </p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {value}
          </p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-md ${colorClasses[color]}`}>
          <div className="h-5 w-5">{icon}</div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
