import React from 'react'

const dashboardWrapper = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
    {/* Sidebar */}
    <main className={'flex w-full flex-col bg-grey-50 dark:bg-dark-bg md:pl-64'}
    >
      {/* Navbar exists in the sidebar */}
      {children}
    </main>
    </div>
  );
}

export default dashboardWrapper;
