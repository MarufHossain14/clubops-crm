"use client";
import { useGetTeamsQuery } from "@/state/api";
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
  { field: "id", headerName: "Org ID", width: 100 },
  { field: "name", headerName: "Organization Name", width: 200 },
  {
    field: "members",
    headerName: "Members",
    width: 150,
    renderCell: (params) => params.value?.length || 0,
  },
  {
    field: "events",
    headerName: "Events",
    width: 150,
    renderCell: (params) => params.value?.length || 0,
  },
  {
    field: "sponsors",
    headerName: "Sponsors",
    width: 150,
    renderCell: (params) => params.value?.length || 0,
  },
];

const Teams = () => {
  const { data: teams, isLoading, isError } = useGetTeamsQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center p-4">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading teams...</div>
      </div>
    );
  }
  if (isError || !teams) {
    return (
      <div className="p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
          <h3 className="mb-2 font-semibold text-red-800 dark:text-red-400">
            Error fetching teams
          </h3>
          <p className="text-sm text-red-600 dark:text-red-500">
            Could not load teams. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Organizations" />
      <div style={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={teams || []}
          columns={columns}
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

export default Teams;
