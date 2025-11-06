'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Search, Settings } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setIsSidebarCollapsed } from '@/state';
import { Menu } from 'lucide-react';
import { setIsDarkMode } from '@/state';
import { Sun, Moon } from 'lucide-react';


const Navbar = () => {

  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const handleDarkModeToggle = () => {
    dispatch(setIsDarkMode(!isDarkMode));
  };

  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3">
      {/* This is where the search bar exists */}
      <div className="flex items-center gap-8">
        {!isSidebarCollapsed ? null : (
          <button onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}>
            <Menu className="h-8 w-8 text-gray-700 dark:text-white" />

          </button>

        )}

        <div className="relative flex w-[200px]">
          <Search className="absolute left-[4px] top-1/2 mr-2 h-5 w-5 -translate-y-1/2 transform cursor-pointer text-black dark:text-white" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full pl-8 bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-gray-500 dark:focus:border-gray-400"
          />
          </div>
          </div>
          {/* { Icons} */}
          <div className="flex items-center">
            <button
              onClick={handleDarkModeToggle}
              className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
              type="button"
            >
              {isDarkMode ? (
                <Sun className="h-6 w-6 cursor-pointer text-yellow-500 dark:text-yellow-400"/>
              ):(
                <Moon className="h-6 w-6 cursor-pointer text-gray-700 dark:text-gray-300"/>
              )}
            </button>


            <Link
            href="/settings"
            className="h-min w-min rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
            <Settings className="h-6 w-6 cursor-pointer text-black dark:text-white" />
            </Link>
            <div className="ml-2 mr-5 hidden min-h-[2em] w-[0.1rem] bg-gray-200 md:inline-block"></div>
      </div>
    </div>
  );
};

export default Navbar
