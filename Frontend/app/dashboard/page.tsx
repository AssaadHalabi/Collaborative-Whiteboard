"use client";

import Loader from "@/components/Loader";
import useAuth from "@/hooks/useAuth";
import React from "react";

const Dashboard = () => {
  const { loading, authenticated, email } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <h1 className='m-14'>{authenticated.toString()}</h1>
      Hello {email}
    </div>
  );
};

export default Dashboard;
