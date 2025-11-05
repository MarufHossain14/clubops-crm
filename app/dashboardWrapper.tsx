import React from 'react'
import Navbar from '@/app/(components)/Navbar';
import Sidebar from '@/app/(components)/Sidebar';

const dashboardlayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="flex min-h-screen w-full bg-white">
    {/* Sidebar */}
    <Sidebar />
    <main className={'flex min-h-screen w-full flex-col md:pl-64'}>
      {/* Navbar exists in the sidebar */}
      <Navbar />
      {children}
    </main>
    </div>
  );
}

const DashboardWrapper = ({children}: {children: React.ReactNode})

export default dashboardWrapper;
