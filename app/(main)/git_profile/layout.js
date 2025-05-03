import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React, { Suspense } from "react";
import { HashLoader } from "react-spinners";

const Layout = ({ children }) => {
  return (
    <div>
      <Link href={"/"}>
        <Button variant="link" className="gap-2 pl-0 cursor-pointer mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back To Home
        </Button>
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-6xl font-bold text-primary mb-5 gradient-title">
          GitHub Profile
        </h1>
      </div>
      <Suspense fallback={<HashLoader className="mt-4" width={"100%"} />}>
        {children}
      </Suspense>
    </div>
  );
};

export default Layout;
