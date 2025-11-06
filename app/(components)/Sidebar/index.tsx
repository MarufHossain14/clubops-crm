'use client'

import React, { useState } from 'react'
import { Lock } from 'lucide-react'

const Sidebar = () => {
  const [showProjects, setShowProjects] = useState(true)
  const [showPriority, setShowPriority] = useState(true)

  const sidebarClassNames =
    'fixed flex h-full flex-col justify-between shadow-xl transition-all duration-300 z-40 overflow-y-auto bg-white dark:bg-gray-900 w-64'

  return (
    <div className={sidebarClassNames}>
      <div className="flex h-full w-full flex-col justify-start">
        {/* Header top LOGO */}
        <div className="z-50 flex min-h-[50px] w-64 items-center justify-between bg-white dark:bg-gray-900 px-6 pt-3">
          <div className="text-xl font-bold text-gray-800 dark:text-white">Laurier Cricket</div>
        </div>

        {/* Teams */}
        <div className="flex items-center gap-5 border-y-[1.5px] border-gray-200 px-8 py-4 dark:border-gray-700">
          <img src="/logo.png" alt="Logo" width={40} height={40} />
          <div>
            <h3 className="text-base font-bold tracking-wide text-gray-800 dark:text-white">Cricket Team 1</h3>
            <div className="mt-1 flex items-start gap-2">
              <Lock className="mt-[0.1rem] h-3 w-3 text-gray-500 dark:text-gray-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Private</p>
            </div>
          </div>
        </div>
        {/* Links for navbar */}
      </div>
    </div>
  )
}

export default Sidebar
