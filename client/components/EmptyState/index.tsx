"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
        <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;

