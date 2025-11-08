"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export const Skeleton = ({
  className = "",
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
}: SkeletonProps) => {
  const baseClasses = "bg-gray-200 dark:bg-gray-700";

  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-pulse",
    none: "",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-busy="true"
      aria-live="polite"
    />
  );
};

export const SkeletonCard = () => (
  <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="mb-3 flex items-start justify-between">
      <div className="flex-1">
        <Skeleton variant="text" height={24} width="60%" className="mb-2" />
        <Skeleton variant="text" height={16} width="40%" />
      </div>
      <Skeleton variant="circular" width={40} height={40} />
    </div>
    <Skeleton variant="text" height={16} width="100%" className="mb-2" />
    <Skeleton variant="text" height={16} width="80%" />
  </div>
);

export const SkeletonTaskCard = () => (
  <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
    <div className="flex items-start gap-4">
      <Skeleton variant="circular" width={12} height={12} className="mt-1" />
      <div className="flex-1">
        <div className="mb-2 flex items-center gap-3">
          <Skeleton variant="text" height={20} width="40%" />
          <Skeleton variant="text" height={16} width="15%" />
        </div>
        <Skeleton variant="text" height={16} width="70%" className="mb-3" />
        <div className="flex gap-4">
          <Skeleton variant="text" height={14} width="20%" />
          <Skeleton variant="text" height={14} width="25%" />
        </div>
      </div>
      <Skeleton variant="circular" width={32} height={32} />
    </div>
  </div>
);

export default Skeleton;

