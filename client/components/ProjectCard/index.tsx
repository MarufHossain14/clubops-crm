import { Project } from "@/state/api";
import React from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Calendar, Folder } from "lucide-react";

type Props = {
  project: Project;
};

const ProjectCard = ({ project }: Props) => {
  const formattedStartDate = project.startsAt
    ? format(new Date(project.startsAt), "MMM dd, yyyy")
    : project.startDate || "Not set";

  const formattedEndDate = project.endsAt
    ? format(new Date(project.endsAt), "MMM dd, yyyy")
    : project.endDate || "Not set";

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2.5 dark:bg-blue-900/30">
              <Folder className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 truncate">
                {project.name || project.title || "Untitled Project"}
              </h3>
              {project.status && (
                <span className="mt-1.5 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {project.status}
                </span>
              )}
            </div>
          </div>
        </div>

        {project.description && (
          <p className="mb-4 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
            {project.description}
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>Start: {formattedStartDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>End: {formattedEndDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
