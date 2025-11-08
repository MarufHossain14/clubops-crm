"use client";

import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import TaskCard from "@/components/TaskCard";
import UserCard from "@/components/UserCard";
import { useSearchQuery } from "@/state/api";
import { Search as SearchIcon } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const {
    data: searchResults,
    isLoading,
    isError,
    error,
  } = useSearchQuery(searchTerm, {
    skip: searchTerm.length < 3,
  });

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounce
    debounceTimer.current = setTimeout(() => {
      setSearchTerm(value);
    }, 500);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const totalResults =
    (searchResults?.volunteerTasks?.length || 0) +
    (searchResults?.events?.length || 0) +
    (searchResults?.members?.length || 0);

  const hasResults = totalResults > 0;
  const showNoResults = searchTerm.length >= 3 && !isLoading && !hasResults && !isError;

  return (
    <div className="px-4 pb-8 xl:px-6">
      <div className="pt-5">
        <Header name="Search" />
      </div>

      {/* Search Input */}
      <div className="mt-6">
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search for tasks, projects, or users... (min 3 characters)"
            className="w-full rounded-lg border-2 border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400"
            onChange={handleSearchChange}
          />
        </div>

        {/* Search Hint */}
        {searchTerm.length > 0 && searchTerm.length < 3 && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Type at least 3 characters to search
          </p>
        )}
      </div>

      {/* Search Results */}
      <div className="mt-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-gray-600 dark:text-gray-400">Searching...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
            <p className="font-semibold text-red-800 dark:text-red-400">
              Error occurred while fetching search results
            </p>
            {error && "status" in error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                Status: {error.status} - {JSON.stringify(error.data || error.error)}
              </p>
            )}
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              Check browser console for more details
            </p>
          </div>
        )}

        {/* No Results State */}
        {showNoResults && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 rounded-full bg-gray-100 p-6 dark:bg-gray-700">
              <SearchIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              No results found
            </h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              No tasks, projects, or users match &quot;{searchTerm}&quot;
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Try a different search term
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && !isError && searchResults && hasResults && (
          <div className="space-y-8">
            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Found {totalResults} result{totalResults !== 1 ? "s" : ""} for &quot;{searchTerm}&quot;
              </p>
            </div>

            {/* Volunteer Tasks Results */}
            {searchResults.volunteerTasks && searchResults.volunteerTasks.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                  Volunteer Tasks ({searchResults.volunteerTasks.length})
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.volunteerTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* Events Results */}
            {searchResults.events && searchResults.events.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                  Events ({searchResults.events.length})
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.events.map((event) => (
                    <ProjectCard key={event.id} project={event} />
                  ))}
                </div>
              </div>
            )}

            {/* Members Results */}
            {searchResults.members && searchResults.members.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                  Members ({searchResults.members.length})
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.members.map((member) => (
                    <UserCard key={member.id || member.email} user={member} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Initial State - No Search Yet */}
        {searchTerm.length === 0 && !isLoading && !isError && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 rounded-full bg-blue-100 p-6 dark:bg-blue-900/20">
              <SearchIcon className="h-12 w-12 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Start searching
            </h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Enter at least 3 characters to search for tasks, projects, or users
            </p>
            <div className="mt-4 text-left text-xs text-gray-400 dark:text-gray-500">
              <p className="font-semibold mb-2">Search tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Search by task title or description</li>
                <li>Search by project name or description</li>
                <li>Search by username</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
