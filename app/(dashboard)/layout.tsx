// app/(dashboard)/layout.tsx
import React from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";


type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="h-full relative">
      {/* Sidebar – only visible on md+ screens */}
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 md:z-[80] bg-gray-900 text-white">
        <div className="p-4">
            <Sidebar />
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
