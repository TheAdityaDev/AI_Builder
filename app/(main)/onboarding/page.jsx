import { industries } from "@/data/industries";
import React from "react";
import { redirect } from "next/navigation";
import OnboardingForm from "./_componets/onboarding-form";
import { getUserOnboardingStatus } from "@/actions/user";

const OnboardingPage = async () => {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (isOnboarded) redirect("/dashboard");
  return (
    <main>
      <OnboardingForm industries={industries} />
    </main>
  );
};

export default OnboardingPage;
