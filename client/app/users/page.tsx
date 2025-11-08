"use client";
import { useGetUsersQuery } from "@/state/api";
import React from "react";
import { useAppSelector } from "../redux";
import Header from "@/components/Header";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";

const CustomToolbar = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <GridToolbarContainer
    className="toolbar flex gap-2"
    sx={{
      backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
      borderBottom: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
      "& .MuiButton-root": {
        color: isDarkMode ? "#e5e7eb" : "#374151",
        "&:hover": {
          backgroundColor: isDarkMode ? "#374151" : "#f3f4f6",
        },
      },
    }}
  >
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 100 },
  { field: "fullName", headerName: "Full Name", width: 200 },
  { field: "email", headerName: "Email", width: 250 },
  { field: "role", headerName: "Role", width: 150 },
  {
    field: "tags",
    headerName: "Tags",
    width: 200,
    renderCell: (params) => {
      if (!params.value || !Array.isArray(params.value)) return <span className="text-gray-500 dark:text-gray-400">-</span>;
      return (
        <div className="flex gap-1">
          {params.value.map((tag: string, index: number) => (
            <span key={index} className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {tag}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    field: "org",
    headerName: "Organization",
    width: 200,
    valueGetter: (params) => {
      if (!params.row || !params.row.org) return "N/A";
      return params.row.org.name || "N/A";
    },
  },
];

const Users = () => {
  const { data: users, isLoading, isError } = useGetUsersQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center p-4">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading users...</div>
      </div>
    );
  }
  if (isError || !users) {
    return (
      <div className="p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
          <h3 className="mb-2 font-semibold text-red-800 dark:text-red-400">
            Error fetching users
          </h3>
          <p className="text-sm text-red-600 dark:text-red-500">
            Could not load users. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Users" />
      <div style={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={users || []}
          columns={columns}
          getRowId={(row) => row.id}
          pagination
          slots={{
            toolbar: () => <CustomToolbar isDarkMode={isDarkMode} />,
          }}
          className={dataGridClassNames}
          sx={dataGridSxStyles(isDarkMode)}
        />
      </div>
    </div>
  );
};

export default Users;
