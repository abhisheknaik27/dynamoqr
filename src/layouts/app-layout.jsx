import React from "react";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <>
      <main className="min-h-screen container ">
        <Outlet />
      </main>

      <div className="p-10 text-center bg-gray-800">Made by Abhishek Naik</div>
    </>
  );
};

export default AppLayout;
