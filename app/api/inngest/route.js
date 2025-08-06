import { serve } from "inngest/next";
import { inngest } from "@/lib/inngist/client";
import { generateIndustryInsights } from "@/lib/inngist/functions";

const isInngestEnabled = process.env.ENABLE_INNGEST === "true";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateIndustryInsights],
  enabled: isInngestEnabled,
});
