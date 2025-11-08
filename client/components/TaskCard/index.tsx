import { Task } from "@/state/api";
import { format } from "date-fns";
import { Calendar, MessageSquareMore, User, Tag } from "lucide-react";
import Image from "next/image";
import React from "react";

type Props = {
  task: Task;
};

const TaskCard = ({ task }: Props) => {
  const taskTagsSplit = task.tags ? task.tags.split(",").filter(tag => tag.trim()) : [];

  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), "MMM dd, yyyy")
    : "";
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), "MMM dd, yyyy")
    : "";

  const numberOfComments = (task.comments && task.comments.length) || 0;

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "Urgent":
        return "text-red-600 dark:text-red-400";
      case "High":
        return "text-orange-600 dark:text-orange-400";
      case "Medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "Low":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "Completed":
        return "text-green-600 dark:text-green-400";
      case "Work In Progress":
        return "text-blue-600 dark:text-blue-400";
      case "Under Review":
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="group border-b border-gray-200 bg-white px-6 py-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/50">
      <div className="flex items-start gap-4">
        {/* Left: Checkbox or Status Indicator */}
        <div className="flex-shrink-0 pt-1">
          <div className={`h-3 w-3 rounded-full ${
            task.status === "Completed"
              ? "bg-green-500"
              : task.status === "Work In Progress"
              ? "bg-blue-500"
              : task.status === "Under Review"
              ? "bg-yellow-500"
              : "bg-gray-300 dark:bg-gray-600"
          }`} />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Title and Priority */}
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                  {task.title}
                </h3>
                {task.priority && (
                  <span className={`text-xs font-medium flex-shrink-0 ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                )}
              </div>

              {/* Description */}
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {task.description}
                </p>
              )}

              {/* Meta Information Row */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                {/* Status */}
                {task.status && (
                  <div className="flex items-center gap-1.5">
                    <span className={`font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                )}

                {/* Dates */}
                {(formattedStartDate || formattedDueDate) && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>
                      {formattedStartDate && formattedDueDate
                        ? `${formattedStartDate} - ${formattedDueDate}`
                        : formattedStartDate || formattedDueDate
                      }
                    </span>
                  </div>
                )}

                {/* Tags */}
                {taskTagsSplit.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Tag size={14} />
                    <div className="flex items-center gap-1.5">
                      {taskTagsSplit.slice(0, 2).map((tag, index) => (
                        <span key={index} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {tag.trim()}
                        </span>
                      ))}
                      {taskTagsSplit.length > 2 && (
                        <span className="text-gray-400">+{taskTagsSplit.length - 2}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Points */}
                {typeof task.points === "number" && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{task.points} pts</span>
                  </div>
                )}

                {/* Comments */}
                {numberOfComments > 0 && (
                  <div className="flex items-center gap-1.5">
                    <MessageSquareMore size={14} />
                    <span>{numberOfComments}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Users and Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* User Avatars */}
              <div className="flex items-center -space-x-2">
                {task.assignee ? (
                  <div className="relative">
                    {task.assignee.profilePictureUrl ? (
                      <Image
                        src={`https://pm-s3-images.s3.us-east-2.amazonaws.com/${task.assignee.profilePictureUrl}`}
                        alt={task.assignee.username}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-gray-800"
                        title={task.assignee.username}
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 dark:border-gray-800 dark:bg-gray-700">
                        <User size={14} className="text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 dark:border-gray-800 dark:bg-gray-700">
                    <User size={14} className="text-gray-400 dark:text-gray-500" />
                  </div>
                )}

                {task.author && task.author.userId !== task.assignee?.userId && (
                  <div className="relative">
                    {task.author.profilePictureUrl ? (
                      <Image
                        src={`https://pm-s3-images.s3.us-east-2.amazonaws.com/${task.author.profilePictureUrl}`}
                        alt={task.author.username}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-gray-800"
                        title={task.author.username}
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 dark:border-gray-800 dark:bg-gray-700">
                        <User size={14} className="text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Attachment indicator */}
              {task.attachments && task.attachments.length > 0 && (
                <div className="text-gray-400 dark:text-gray-500" title={`${task.attachments.length} attachment(s)`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
