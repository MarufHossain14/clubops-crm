'use client';

import React, { useEffect } from 'react'
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import StoreProvider, { useAppSelector } from './redux';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import { ToastProvider } from '@/components/Toast/ToastContainer';

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
    <>
      <SignedIn>
        <div className="flex min-h-screen w-full bg-gray-50 dark:bg-[#101214] text-gray-900 dark:text-white">
          {/* Sidebar */}
          <Sidebar />
          <main className={`flex w-full flex-col bg-gray-50 dark:bg-[#101214] transition-all duration-300 pl-0 ${isSideBarCollapsed ? "md:pl-16" : "md:pl-64"}`}>
            {/* Navbar exists in the sidebar */}
            <Navbar />
            {children}
          </main>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#101214]">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-black">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Event Management CRM
              </h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                Sign in to access your dashboard
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <SignInButton mode="modal">
                <button className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-black dark:text-gray-300 dark:hover:bg-gray-900">
                  Create Account
                </button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
}

const DashboardWrapper = ({children}: {children: React.ReactNode}) => {
  return (
    <StoreProvider>
      <ToastProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </ToastProvider>
    </StoreProvider>
  );
};

export default DashboardWrapper;
