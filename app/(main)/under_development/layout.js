import React, { Suspense } from "react";
import { HashLoader } from "react-spinners";

const Layout = ({ children }) => {
  return (
    <div>
      <Suspense fallback={<HashLoader className="mt-4" width={"100%"} />}>
        {children}
      </Suspense>
    </div>
  );
};

export default Layout;
