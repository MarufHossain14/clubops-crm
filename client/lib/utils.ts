export const dataGridClassNames =
  "border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800";

export const dataGridSxStyles = (isDarkMode: boolean) => {
  return {
    backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
    color: isDarkMode ? "#e5e7eb" : "#111827",
    borderColor: isDarkMode ? "#374151" : "#e5e7eb",
    "&": {
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
    },
    "& .MuiDataGrid-root": {
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
      borderColor: isDarkMode ? "#374151" : "#e5e7eb",
    },
    "& .MuiDataGrid-main": {
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
    },
    "& .MuiDataGrid-container--top": {
      backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
    },
    "& .MuiDataGrid-filler": {
      backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
      borderRight: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
      color: isDarkMode ? "#e5e7eb" : "#374151",
      borderBottom: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
      "& .MuiDataGrid-columnHeader": {
        backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
        color: isDarkMode ? "#e5e7eb" : "#374151",
        borderRight: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
      },
      '& [role="columnheader"]': {
        backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
        color: isDarkMode ? "#e5e7eb" : "#374151",
        borderRight: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
        "&:focus": {
          outline: "none",
        },
        "&:focus-within": {
          outline: "none",
        },
      },
      "& .MuiDataGrid-columnHeaderRow": {
        backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
      },
    },
    "& .MuiDataGrid-columnHeaderRow": {
      backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
      "& .MuiDataGrid-cell": {
        backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
        borderRight: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
      },
      "&:last-child": {
        backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
      },
    },
    "& .MuiDataGrid-columnHeadersInner": {
      backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
    },
    "& .MuiDataGrid-columnHeader--empty": {
      backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
      borderRight: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
    },
    "& .MuiDataGrid-columnHeader:last-child": {
      borderRight: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
    },
    "& .MuiDataGrid-scrollbar": {
      backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
      "& .MuiDataGrid-scrollbar--vertical": {
        backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
      },
      "& .MuiDataGrid-scrollbar--horizontal": {
        backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
      },
    },
    "& .MuiDataGrid-virtualScroller": {
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
    },
    "& .MuiDataGrid-virtualScrollerContent": {
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
    },
    "& .MuiDataGrid-virtualScrollerRenderZone": {
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
      },
    "& .MuiDataGrid-row": {
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
      color: isDarkMode ? "#e5e7eb" : "#111827",
      borderBottom: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
      "&:hover": {
        backgroundColor: isDarkMode ? "#374151" : "#f9fafb",
      },
      "&.Mui-selected": {
        backgroundColor: isDarkMode ? "#1e40af" : "#dbeafe",
        "&:hover": {
          backgroundColor: isDarkMode ? "#2563eb" : "#bfdbfe",
        },
      },
    },
    "& .MuiDataGrid-cell": {
      color: isDarkMode ? "#e5e7eb" : "#111827",
      borderRight: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
      "&:focus": {
        outline: "none",
      },
      "&:focus-within": {
        outline: "none",
      },
    },
    "& .MuiDataGrid-footerContainer": {
      backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
      borderTop: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
      color: isDarkMode ? "#e5e7eb" : "#374151",
    },
    "& .MuiDataGrid-toolbarContainer": {
      backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
      color: isDarkMode ? "#e5e7eb" : "#374151",
      borderBottom: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
    },
    "& .MuiIconButton-root": {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
      "&:hover": {
        backgroundColor: isDarkMode ? "#374151" : "#f3f4f6",
      },
    },
    "& .MuiTablePagination-root": {
      color: isDarkMode ? "#e5e7eb" : "#374151",
    },
    "& .MuiTablePagination-selectLabel": {
      color: isDarkMode ? "#e5e7eb" : "#374151",
    },
    "& .MuiTablePagination-displayedRows": {
      color: isDarkMode ? "#e5e7eb" : "#374151",
    },
    "& .MuiTablePagination-select": {
      color: isDarkMode ? "#e5e7eb" : "#374151",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: isDarkMode ? "#374151" : "#d1d5db",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: isDarkMode ? "#4b5563" : "#9ca3af",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: isDarkMode ? "#60a5fa" : "#3b82f6",
      },
    },
    "& .MuiTablePagination-selectIcon": {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
    "& .MuiDataGrid-menuIconButton": {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
    "& .MuiDataGrid-sortIcon": {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
    "& .MuiDataGrid-filterIcon": {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
    "& .MuiCheckbox-root": {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
      "&.Mui-checked": {
        color: isDarkMode ? "#60a5fa" : "#3b82f6",
      },
    },
    "& .MuiDataGrid-overlay": {
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
      color: isDarkMode ? "#e5e7eb" : "#374151",
    },
    "& .MuiDataGrid-loadingOverlay": {
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
    },
    "& .MuiDataGrid-noRowsOverlay": {
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
      color: isDarkMode ? "#e5e7eb" : "#374151",
    },
    // Target any empty cells or fill areas
    "& .MuiDataGrid-columnHeader:empty": {
      backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
    },
    "& .MuiDataGrid-cell:empty": {
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
    },
    // Ensure the entire header area is dark
    "& .MuiDataGrid-columnHeaders": {
      "&::after": {
        backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
      },
      "&::before": {
        backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
      },
    },
    // Target any wrapper or container divs
    "& > div": {
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
    },
    "& .MuiDataGrid-root > div": {
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
    },
  };
};
