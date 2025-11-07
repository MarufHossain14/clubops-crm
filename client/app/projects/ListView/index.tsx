import Header from "@/components/Header";
import TaskCard from "@/components/TaskCard";
import { Task, useGetTasksQuery } from "@/state/api";
import React from "react";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const ListView = ({ id, setIsModalNewTaskOpen }: Props) => {
  const projectId = Number(id);
  const {
    data: tasks,
    error,
    isLoading,
  } = useGetTasksQuery(
    { projectId },
    { skip: isNaN(projectId) || projectId <= 0 }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) {
    console.error("Error fetching tasks:", error);
    return (
      <div className="p-4 text-red-500">
        <p>An error occurred while fetching tasks</p>
        <p className="text-sm mt-2">
          {"status" in error ? `Status: ${error.status}` : ""}
          {"data" in error && error.data ? JSON.stringify(error.data) : ""}
          {"error" in error ? String(error.error) : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-8 xl:px-6">
      <div className="pt-5">
        <Header
          name="List"
          buttonComponent={
            <button
              className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              Add Task
            </button>
          }
          isSmallText
        />
      </div>
      {tasks && tasks.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
          {/* List Header */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 dark:border-stroke-dark dark:bg-dark-tertiary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Task
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </div>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Assignee
              </div>
            </div>
          </div>

          {/* List Items */}
          <div className="divide-y divide-gray-200 dark:divide-stroke-dark">
            {tasks.map((task: Task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 text-center dark:border-stroke-dark dark:bg-dark-secondary">
          <div className="mb-4 rounded-full bg-gray-100 p-6 dark:bg-dark-tertiary">
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
            No tasks found
          </h3>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating a new task
          </p>
          <button
            className="rounded-lg bg-blue-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            Create Task
          </button>
        </div>
      )}
    </div>
  );
};

export default ListView;
