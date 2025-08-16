import Header from "@/components/header";
import React from "react";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="px-6">
      <main className="min-h-screen">
        <Header />
        <Outlet />
      </main>

      <div className="p-10 text-center bg-gray-800">Made by Abhishek Naik</div>
    </div>
  );
};

export default AppLayout;
