"use client";

import React, { useState, use, useEffect } from "react";
import ProjectHeader from "@/app/projects/ProjectHeader";
import Board from "../BoardView";
import List from "../ListView";
import Timeline from "../TimelineView";
import Table from "../TableView";
import EventDetails from "../EventDetailsView";
import ModalNewTask from "@/components/ModalNewTask";
import EventRiskAnalysis from "@/components/EventRiskAnalysis";
import { useGetProjectsQuery } from "@/state/api";

type Props = {
  params: Promise<{ id: string }>;
};

const Project = ({ params }: Props) => {
  // Unwrap params Promise (Next.js 16+ requirement)
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("Board");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  const projectId = Number(id);
  const { data: projects } = useGetProjectsQuery();
  const currentProject = projects?.find((p) => p.id === projectId);

  // Debug logging
  useEffect(() => {
    console.log("Project Page - ID from URL:", id);
    console.log("Project Page - Converted projectId:", projectId);
    console.log("Project Page - Current project:", currentProject);
    console.log("Project Page - All projects:", projects);
  }, [id, projectId, currentProject, projects]);

  // Show error if project not found
  if (projects && !currentProject && !isNaN(projectId) && projectId > 0) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
          <h3 className="mb-2 font-semibold text-yellow-800 dark:text-yellow-400">
            Project Not Found
          </h3>
          <p className="text-sm text-yellow-600 dark:text-yellow-500">
            Project with ID {projectId} does not exist.
          </p>
          <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-500">
            Available project IDs: {projects.map((p) => p.id).join(", ")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
        id={id}
      />
      <ProjectHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projectName={currentProject?.title || currentProject?.name || "Project"}
        projectId={projectId}
      />
      {activeTab === "Board" && (
        <Board id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "List" && (
        <List id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "Timeline" && (
        <Timeline id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "Table" && (
        <Table id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "Event Details" && (
        <EventDetails eventId={projectId} />
      )}
      {activeTab === "Risk Analysis" && (
        <div className="px-4 pb-8 xl:px-6">
          <div className="pt-5">
            <EventRiskAnalysis eventId={projectId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Project;
