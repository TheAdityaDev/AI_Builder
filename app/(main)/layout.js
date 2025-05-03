"use client"
import React, { useEffect, useState } from "react";
import Loader from "./interview_AI/_components/Loader";

const MainLayout = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading process
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Adjust the timeout as needed

    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="container mx-auto mt-24 mb-20">
      {isLoading ? (
        <div className="flex justify-center align-center">
          <Loader />
        </div> // Add your loader component or message here
      ) : (
        children
      )}
    </div>
  );
};

export default MainLayout;
