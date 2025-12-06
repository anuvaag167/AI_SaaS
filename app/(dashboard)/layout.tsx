// app/(dashboard)/layout.tsx
import React from "react";

import Sidebar from "@/components/sidebar";
import { getApiLimitCount } from "@/lib/api-limit";
import Navbar from "@/components/navbar";


type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout = async({ children }: DashboardLayoutProps) => {

  const apiLimitCount = await getApiLimitCount()

  return (
    <div className="h-full relative">
      {/* Sidebar – only visible on md+ screens */}
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 md:z-[80] bg-gray-900 text-white">
        <div className="p-4">
            <Sidebar apiLimitCount={apiLimitCount}/>
        </div>
      </div>

      {/* Main content – pushed right when sidebar visible */}
      <main className="md:pl-72">
        <Navbar />
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
