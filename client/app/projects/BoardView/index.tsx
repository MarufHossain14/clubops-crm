import { useGetTasksQuery, useUpdateTaskStatusMutation, Task as TaskType } from "@/state/api";
import React, { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { EllipsisVertical, MessageSquareMore, Plus, User } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import TaskDetailModal from "@/components/TaskDetailModal";

type BoardProps = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const taskStatus = ["To Do", "Work In Progress", "Under Review", "Completed"];

const BoardView = ({ id, setIsModalNewTaskOpen }: BoardProps) => {
  const eventId = Number(id);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("BoardView - Project ID from URL:", id);
    console.log("BoardView - Converted eventId:", eventId);
    console.log("BoardView - Is valid:", !isNaN(eventId) && eventId > 0);
  }, [id, eventId]);

  const {
    data: tasks,
    isLoading,
    error,
    isError,
  } = useGetTasksQuery(
    { eventId },
    { skip: isNaN(eventId) || eventId <= 0 }
  );

  // Debug logging for tasks
  useEffect(() => {
    console.log("BoardView - Tasks data:", tasks);
    console.log("BoardView - Tasks count:", tasks?.length || 0);
    console.log("BoardView - Loading:", isLoading);
    console.log("BoardView - Error:", error);
    if (error) {
      console.error("BoardView - Full error object:", error);
    }
  }, [tasks, isLoading, error]);
  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  const moveTask = (taskId: number, toStatus: string) => {
    updateTaskStatus({ taskId, status: toStatus });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center p-4">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading tasks...</div>
      </div>
    );
  }

  if (error || isError) {
    console.error("Error fetching tasks:", error);
    return (
      <div className="p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
          <h3 className="mb-2 font-semibold text-red-800 dark:text-red-400">
            Error fetching tasks
          </h3>
          <p className="text-sm text-red-600 dark:text-red-500">
            {error && "status" in error ? `Status: ${error.status}` : "Unknown error"}
          </p>
          {error && "data" in error && error.data && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              {typeof error.data === "string" ? error.data : JSON.stringify(error.data)}
            </p>
          )}
          <p className="mt-2 text-xs text-red-600 dark:text-red-500">
            Project ID: {eventId}
          </p>
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-4">
        <DndProvider backend={HTML5Backend}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {taskStatus.map((status) => (
              <TaskColumn
                key={status}
                status={status}
                tasks={[]}
                moveTask={moveTask}
                setIsModalNewTaskOpen={setIsModalNewTaskOpen}
              />
            ))}
          </div>
        </DndProvider>
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-12 dark:border-gray-700 dark:bg-gray-800">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            No tasks found
          </h3>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            This project doesn't have any tasks yet. Create your first task to get started.
          </p>
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            Create Task
          </button>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
        {taskStatus.map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={tasks || []}
            moveTask={moveTask}
            setIsModalNewTaskOpen={setIsModalNewTaskOpen}
            onTaskClick={(task) => {
              setSelectedTask(task);
              setIsTaskDetailOpen(true);
            }}
          />
        ))}
      </div>
      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskDetailOpen}
        onClose={() => {
          setIsTaskDetailOpen(false);
          setSelectedTask(null);
        }}
      />
    </DndProvider>
  );
};

type TaskColumnProps = {
  status: string;
  tasks: TaskType[];
  moveTask: (taskId: number, toStatus: string) => void;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  onTaskClick: (task: TaskType) => void;
};

const TaskColumn = ({
  status,
  tasks,
  moveTask,
  setIsModalNewTaskOpen,
  onTaskClick,
}: TaskColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: number }) => moveTask(item.id, status),
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const tasksCount = tasks.filter((task) => task.status === status).length;

  const statusColor: any = {
    "To Do": "#2563EB",
    "Work In Progress": "#059669",
    "Under Review": "#D97706",
    Completed: "#000000",
  };

  return (
    <div
      ref={(instance) => {
        drop(instance);
      }}
      className={`sl:py-4 rounded-lg py-2 xl:px-2 ${isOver ? "bg-blue-100 dark:bg-neutral-950" : ""}`}
    >
      <div className="mb-3 flex w-full">
        <div
          className={`w-2 !bg-[${statusColor[status]}] rounded-s-lg`}
          style={{ backgroundColor: statusColor[status] }}
        />
        <div className="flex w-full items-center justify-between rounded-e-lg bg-white px-5 py-4 dark:bg-gray-800">
          <h3 className="flex items-center text-lg font-semibold dark:text-white">
            {status}{" "}
            <span
              className="ml-2 inline-block rounded-full bg-gray-200 p-1 text-center text-sm leading-none dark:bg-gray-700"
              style={{ width: "1.5rem", height: "1.5rem" }}
            >
              {tasksCount}
            </span>
          </h3>
          <div className="flex items-center gap-2">
            <button className="flex h-6 w-5 items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <EllipsisVertical size={26} />
            </button>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white transition-all hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
              onClick={() => setIsModalNewTaskOpen(true)}
              title="Create Task"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>

      {tasks
        .filter((task) => task.status === status)
        .map((task) => (
          <Task key={task.id} task={task} onTaskClick={onTaskClick} />
        ))}
    </div>
  );
};

type TaskProps = {
  task: TaskType;
  onTaskClick: (task: TaskType) => void;
};

const Task = ({ task, onTaskClick }: TaskProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const taskTagsSplit = task.tags ? task.tags.split(",") : [];

  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), "P")
    : "";
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), "P")
    : "";

  const numberOfComments = (task.comments && task.comments.length) || 0;

  const PriorityTag = ({ priority }: { priority: TaskType["priority"] }) => (
    <div
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        priority === "Urgent"
          ? "bg-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          : priority === "High"
            ? "bg-yellow-200 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            : priority === "Medium"
              ? "bg-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : priority === "Low"
                ? "bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
      }`}
    >
      {priority}
    </div>
  );

  return (
    <div
      ref={(instance) => {
        drag(instance);
      }}
      onClick={() => onTaskClick(task)}
      className={`mb-4 cursor-pointer rounded-md bg-white shadow transition-all hover:shadow-lg dark:bg-gray-800 dark:border dark:border-gray-700 ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      {task.attachments && task.attachments.length > 0 && (() => {
        const attachment = task.attachments[0];
        const isImage = attachment.fileName?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
        const fileUrl = attachment.fileUrl;

        // Only use Next.js Image for actual image files from allowed domains
        const isAllowedDomain = fileUrl && (
          fileUrl.includes('pm-s3-images.s3.us-east-2.amazonaws.com') ||
          fileUrl.startsWith('data:') ||
          fileUrl.startsWith('/')
        );

        if (isImage && isAllowedDomain) {
          return (
            <div className="relative h-48 w-full overflow-hidden rounded-t-md bg-gray-100 dark:bg-gray-700">
        <Image
                src={fileUrl}
                alt={attachment.fileName || 'Attachment'}
          width={400}
          height={200}
                className="h-full w-full object-cover"
                unoptimized={fileUrl.startsWith('data:')}
              />
            </div>
          );
        }

        // For non-images (PDFs, docs, etc.) or non-allowed domains, show a placeholder
        return (
          <div className="flex h-32 w-full items-center justify-center rounded-t-md bg-gray-100 dark:bg-gray-700">
            <div className="text-center">
              <svg
                className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
        />
              </svg>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate px-2">
                {attachment.fileName || 'Attachment'}
              </p>
              {task.attachments.length > 1 && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  +{task.attachments.length - 1} more
                </p>
              )}
            </div>
          </div>
        );
      })()}
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {task.priority && <PriorityTag priority={task.priority} />}
            <div className="flex gap-2">
              {taskTagsSplit.map((tag) => (
                <div
                  key={tag}
                  className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
          <button className="flex h-6 w-4 flex-shrink-0 items-center justify-center dark:text-gray-400">
            <EllipsisVertical size={26} />
          </button>
        </div>

        <div className="my-3 flex justify-between">
          <h4 className="text-md font-bold dark:text-white">{task.title}</h4>
          {typeof task.points === "number" && (
            <div className="text-xs font-semibold dark:text-white">
              {task.points} pts
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formattedStartDate && <span>{formattedStartDate} - </span>}
          {formattedDueDate && <span>{formattedDueDate}</span>}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {task.description}
        </p>
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700" />

        {/* Users */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex -space-x-[6px] overflow-hidden">
            {task.assignee && (
              task.assignee.profilePictureUrl ? (
                <Image
                  key={task.assignee.userId}
                  src={`https://pm-s3-images.s3.us-east-2.amazonaws.com/${task.assignee.profilePictureUrl}`}
                  alt={task.assignee.username}
                  width={30}
                  height={30}
                  className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-gray-800"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 dark:border-gray-800 dark:bg-gray-700">
                  <User size={14} className="text-gray-500 dark:text-gray-400" />
                </div>
              )
            )}
            {task.author && (
              task.author.profilePictureUrl ? (
                <Image
                  key={task.author.userId}
                  src={`https://pm-s3-images.s3.us-east-2.amazonaws.com/${task.author.profilePictureUrl}`}
                  alt={task.author.username}
                  width={30}
                  height={30}
                  className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-gray-800"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 dark:border-gray-800 dark:bg-gray-700">
                  <User size={14} className="text-gray-500 dark:text-gray-400" />
                </div>
              )
            )}
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <MessageSquareMore size={20} />
            <span className="ml-1 text-sm dark:text-gray-300">
              {numberOfComments}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardView;
