import Header from "@/components/header";
import React from "react";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="flex flex-col h-screen px-4">
      <main className="flex-grow">
        <Header />
        <Outlet />
      </main>

      <footer className="text-muted-foreground border-t bg-gray-50 py-8 text-center text-sm ">
        <span className="font-bold ">dynamoQR</span> by Abhishek Naik
      </footer>
    </div>
  );
};

export default AppLayout;
