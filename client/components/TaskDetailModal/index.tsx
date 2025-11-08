"use client";

import { Task } from "@/state/api";
import { format } from "date-fns";
import { X, Calendar, User, FileText, Paperclip, MessageSquare, Tag } from "lucide-react";
import React from "react";
import Image from "next/image";

type Props = {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
};

const TaskDetailModal = ({ task, isOpen, onClose }: Props) => {
  if (!isOpen || !task) return null;

  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), "MMM dd, yyyy 'at' h:mm a")
    : task.dueAt
    ? format(new Date(task.dueAt), "MMM dd, yyyy 'at' h:mm a")
    : "No due date";

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "High":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Work In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm dark:bg-gray-900/75"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-800 dark:shadow-2xl dark:shadow-black/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {task.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {task.priority && (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority} Priority
                </span>
              )}
              {task.status && (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                    task.status
                  )}`}
                >
                  {task.status}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {task.description && (
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <FileText className="h-4 w-4" />
                Description
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Due Date */}
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Calendar className="h-4 w-4" />
                Due Date
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{formattedDueDate}</p>
            </div>

            {/* Assignee */}
            {task.assignee && (
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <User className="h-4 w-4" />
                  Assignee
                </h3>
                <div className="flex items-center gap-2">
                  {task.assignee.profilePictureUrl ? (
                    <Image
                      src={`https://pm-s3-images.s3.us-east-2.amazonaws.com/${task.assignee.profilePictureUrl}`}
                      alt={task.assignee.username}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {task.assignee.username}
                  </span>
                </div>
              </div>
            )}

            {/* Project */}
            {task.event && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Project
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {task.event.title || task.event.name}
                </p>
              </div>
            )}
          </div>

          {/* Notes Section */}
          {task.notes && task.notes.length > 0 && (
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <MessageSquare className="h-5 w-5" />
                Notes ({task.notes.length})
              </h3>
              <div className="space-y-4">
                {task.notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {note.createdAt
                          ? format(new Date(note.createdAt), "MMM dd, yyyy 'at' h:mm a")
                          : "Unknown date"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments Section */}
          {task.attachments && task.attachments.length > 0 && (
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <Paperclip className="h-5 w-5" />
                Attachments ({task.attachments.length})
              </h3>
              <div className="space-y-2">
                {task.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50 dark:hover:bg-gray-700"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Paperclip className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {attachment.fileName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {attachment.uploadedAt
                          ? format(new Date(attachment.uploadedAt), "MMM dd, yyyy")
                          : "Unknown date"}
                      </p>
                    </div>
                    <svg
                      className="h-5 w-5 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Empty States */}
          {(!task.notes || task.notes.length === 0) &&
            (!task.attachments || task.attachments.length === 0) && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-700/50">
                <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  No notes or attachments for this task
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;

