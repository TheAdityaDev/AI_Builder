import { serve } from "inngest/next";
import { inngest } from "@/lib/inngist/client";
import { generateIndustryInsights } from "@/lib/inngist/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateIndustryInsights],
});
