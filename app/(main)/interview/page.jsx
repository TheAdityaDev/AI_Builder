import React from "react";
import { getAssessments } from "@/actions/interview";
import PerformanceChart from "./_components/performance-chart";
import QuizList from "./_components/quiz-list";
import StackCards from "./_components/stats-card";



const InterviewPage = async () => {

  const assessment = await getAssessments()
  return (
    <div className="space-y-6">
      <div className="text-6xl font-bold gradient-title mb-5">
        <h1>Interview Preparation</h1>
      </div>
      <div>
        <StackCards assessment={assessment} />
        <PerformanceChart assessment={assessment} />
        <QuizList assessment={assessment} />

      </div>
    </div>
  )
};

export default InterviewPage;
