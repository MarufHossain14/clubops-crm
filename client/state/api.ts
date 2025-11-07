import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

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
  teamId: number;
  teamName: string;
  productOwnerUserId?: number;
  projectManagerUserId?: number;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    prepareHeaders: async (headers) => {
      // AWS Amplify auth commented out
      // const session = await fetchAuthSession();
      // const { accessToken } = session.tokens ?? {};
      // if (accessToken) {
      //   headers.set("Authorization", `Bearer ${accessToken}`);
      // }
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: ["Projects", "Tasks", "Users", "Teams"],
  endpoints: (build) => ({
    getAuthUser: build.query({
      queryFn: async (_, _queryApi, _extraoptions, fetchWithBQ) => {
        // AWS Amplify auth commented out
        // try {
        //   const user = await getCurrentUser();
        //   const session = await fetchAuthSession();
        //   if (!session) throw new Error("No session found");
        //   const { userSub } = session;
        //   const { accessToken } = session.tokens ?? {};
        //
        //   const userDetailsResponse = await fetchWithBQ(`users/${userSub}`);
        //   const userDetails = userDetailsResponse.data as User;
        //
        //   return { data: { user, userSub, userDetails } };
        // } catch (error: any) {
        //   return { error: error.message || "Could not fetch user data" };
        // }
        return { error: "AWS Amplify auth is disabled" };
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
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useSearchQuery,
  useGetUsersQuery,
  useGetTeamsQuery,
  useGetTasksByUserQuery,
  useGetAuthUserQuery,
} = api;
