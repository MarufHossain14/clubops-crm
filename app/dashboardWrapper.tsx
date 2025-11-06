'use client';

import React, { useEffect } from 'react'
import Navbar from '@/app/(components)/Navbar';
import Sidebar from '@/app/(components)/Sidebar';
import StoreProvider, { useAppSelector } from './redux';

const DashboardLayout = ({children}: {children: React.ReactNode}) => {
  const isSideBarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed,);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  useEffect(() => {
    // Apply dark mode class to html element
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);


  return (
    <div className="flex min-h-screen w-full bg-gray-50 dark:bg-[#101214] text-gray-900 dark:text-white">
    {/* Sidebar */}
    <Sidebar />
    <main className={`flex w-full flex-col bg-gray-50 dark:bg-[#101214] transition-all duration-300 ${isSideBarCollapsed ? "md:pl-16" : "md:pl-64"}`}>
      {/* Navbar exists in the sidebar */}
      <Navbar />
      {children}
    </main>
    </div>
  );
}

const DashboardWrapper = ({children}: {children: React.ReactNode}) => {
  return (
    <StoreProvider>
    <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  );
};

export default DashboardWrapper;
