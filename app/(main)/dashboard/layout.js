import React, { Suspense } from "react";
import { HashLoader } from "react-spinners";

const Layout = ({ children }) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-6xl font-bold text-primary mb-5 gradient-title">
          Industry Insights
        </h1>
      </div>
      <Suspense fallback={<HashLoader className="mt-4" width={"100%"} />}>
        {children}
      </Suspense>
    </div>
  );
};

export default Layout;
