import { getIndustriesInsights } from "@/actions/dashboard";
import { getUserOnboardingStatus } from "@/actions/user";
import React from "react";
import DashboardView from "./_components/dash-boardView";

const page = async () => {
  const { isOnboarded } = await getUserOnboardingStatus();
  const insights = await getIndustriesInsights();

  if (!isOnboarded) redirect("/onboarding");
  return (
    <div className="container mx-auto">
      <DashboardView insights={insights} />
    </div>
  );
};

export default page;
