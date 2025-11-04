import React from 'react';
import Link from 'next/link';
import { Search, Settings } from 'lucide-react';

const Navbar = () => {
  return (
    <div className="flex items-center justify-between bg-white px-4 py-3">
      {/* This is where the search bar exists */}
      <div className="flex items-center gap-8">
        <div className="relative flex w-[200px]">
          <Search className="absolute left-[4px] top-1/2 mr-2 h-5 w-5 -translate-y-1/2 transform cursor-pointer text-black" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full pl-8"
          />
          </div>
          </div>
          {/* { Icons} */}
          <div className="flex items-center">
            <Link
            href="/settings"
            className="h-min w-min rounded p-2 hover:bg-gray-100"
            >
            <Settings className="h-6 w-6 cursor-pointer text-black" />
            </Link>
            <div className="ml-2 mr-5 hidden min-h-[2em] w-[0.1rem] bg-gray-200 md:inline-block"></div>
      </div>
    </div>
  );
};

export default Navbar
