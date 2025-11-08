import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getClerkToken } from "@/lib/clerkAuth";

export interface Project {
  id: number;
  title: string;
  startsAt: string;
  endsAt: string;
  location?: string;
  status: string;
  capacity?: number;
  orgId: number;
  org?: Org;
  rsvps?: RSVP[];
  volunteerTasks?: Task[];
}

export enum Priority {
  Urgent = "Urgent",
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Backlog = "Backlog",
}

export enum Status {
  ToDo = "To Do",
  WorkInProgress = "Work In Progress",
  UnderReview = "Under Review",
  Completed = "Completed",
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  tags: string[];
  orgId: number;
  lastSeenAt?: string;
  org?: Org;
}

export interface Attachment {
  id: number;
  fileUrl: string;
  fileName: string;
  volunteerTaskId?: number;
  uploadedByMemberId?: number;
  uploadedAt: string;
}

export interface Task {
  id: number;
  title: string;
  status: string;
  priority?: Priority | string;
  dueAt?: string;
  eventId: number;
  orgId: number;
  assigneeMemberId?: number;
  event?: Project;
  assignee?: User;
  notes?: Note[];
  attachments?: Attachment[];
}

export interface Org {
  id: number;
  name: string;
  createdAt: string;
}

export interface RSVP {
  id: number;
  eventId: number;
  memberId: number;
  status: string;
  checkedIn: boolean;
}

export interface Note {
  id: number;
  authorMemberId: number;
  volunteerTaskId?: number;
  content: string;
  createdAt: string;
}

export interface SearchResults {
  volunteerTasks?: Task[];
  events?: Project[];
  members?: User[];
}

export interface Team {
  id: number;
  name: string;
  createdAt: string;
  members?: User[];
  events?: Project[];
  sponsors?: Sponsor[];
}

export interface Sponsor {
  id: number;
  orgId: number;
  name: string;
  contactEmail?: string;
  tier?: string;
  stage: string;
  pledged?: number;
  received?: number;
  org?: Org;
}

export interface RSVP {
  id: number;
  eventId: number;
  memberId: number;
  status: string;
  checkedIn: boolean;
  event?: Project;
  member?: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
}

export interface EventRisk {
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
  suggestion: string;
  data?: any;
}

export interface EventRiskAnalysis {
  eventId: number;
  eventTitle: string;
  riskLevel: "low" | "medium" | "high";
  riskScore: number;
  risks: EventRisk[];
  summary: {
    totalRisks: number;
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
  };
}

export interface GeneratedEmail {
  subject: string;
  body: string;
  to: string;
}

export interface EmailGenerationRequest {
  type: "event_reminder" | "task_assignment" | "task_reminder" | "sponsor_thank_you" | "rsvp_confirmation";
  eventId?: number;
  taskId?: number;
  memberId?: number;
  recipientEmail?: string;
  recipientName?: string;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    prepareHeaders: async (headers) => {
      // Get Clerk token and add to Authorization header
      const token = await getClerkToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: ["Projects", "Tasks", "Users", "Teams", "RSVPs", "Sponsors"],
  endpoints: (build) => ({
    getAuthUser: build.query({
      queryFn: async () => {
        // Clerk auth - user info is available from Clerk's useUser hook
        // This endpoint is kept for compatibility but returns null
        // Use Clerk's useUser() hook in components instead
        return { data: null };
      },
    }),
    getProjects: build.query<Project[], void>({
      query: () => "projects",
      providesTags: ["Projects"],
    }),
    createProject: build.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: "projects",
        method: "POST",
        body: project,
      }),
      invalidatesTags: ["Projects"],
    }),
    getAllTasks: build.query<Task[], void>({
      query: () => "tasks/all",
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks" as const, id }))
          : [{ type: "Tasks" as const }],
    }),
    getTasks: build.query<Task[], { eventId: number }>({
      query: ({ eventId }) => `tasks?eventId=${eventId}`,
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks" as const, id }))
          : [{ type: "Tasks" as const }],
    }),
    getTasksByUser: build.query<Task[], number>({
      query: (memberId) => `tasks/member/${memberId}`,
      providesTags: (result, error, memberId) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks", id }))
          : [{ type: "Tasks", id: memberId }],
    }),
    getRSVPs: build.query<RSVP[], { eventId?: number }>({
      query: ({ eventId }) => eventId ? `rsvps?eventId=${eventId}` : "rsvps/all",
      providesTags: ["RSVPs"],
    }),
    getSponsors: build.query<Sponsor[], { orgId?: number }>({
      query: ({ orgId }) => orgId ? `sponsors?orgId=${orgId}` : "sponsors/all",
      providesTags: ["Sponsors"],
    }),
    createTask: build.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: "tasks",
        method: "POST",
        body: task,
      }),
      invalidatesTags: ["Tasks"],
    }),
    updateTaskStatus: build.mutation<Task, { taskId: number; status: string }>({
      query: ({ taskId, status }) => ({
        url: `tasks/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
    }),
    getUsers: build.query<User[], void>({
      query: () => "users",
      providesTags: ["Users"],
    }),
    getTeams: build.query<Team[], void>({
      query: () => "teams",
      providesTags: ["Teams"],
    }),
    search: build.query<SearchResults, string>({
      query: (query) => `search?query=${encodeURIComponent(query)}`,
    }),
    // AI Features
    getEventRisks: build.query<EventRiskAnalysis, number>({
      query: (eventId) => `ai/events/${eventId}/risks`,
    }),
    getAllEventsWithRisks: build.query<Array<{ eventId: number; eventTitle: string; riskLevel: string; riskCount: number }>, void>({
      query: () => "ai/events/risks",
    }),
    generateEmail: build.mutation<{ success: boolean; email: GeneratedEmail; generatedAt: string }, EmailGenerationRequest>({
      query: (body) => ({
        url: "ai/email/generate",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetAllTasksQuery,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useSearchQuery,
  useGetUsersQuery,
  useGetTeamsQuery,
  useGetTasksByUserQuery,
  useGetAuthUserQuery,
  useGetRSVPsQuery,
  useGetSponsorsQuery,
  useGetEventRisksQuery,
  useGetAllEventsWithRisksQuery,
  useGenerateEmailMutation,
} = api;
