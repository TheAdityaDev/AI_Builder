import { serve } from "inngest/next";
import { inngest } from "@/lib/inngist/client";
import { generateIndustryInsights } from "@/lib/inngist/functions";

// ... existing code ...
const isDevelopment = process.env.NODE_ENV === 'development';

export const { GET, POST, PUT } = serve({
  client: isDevelopment ? inngest : ({
    send: async () => {} // Empty implementation for production builds
  }),
  functions: [isDevelopment ? generateIndustryInsights : () => ({})], // Empty implementation for production builds
});

// export const { GET, POST, PUT } = serve({
//   client: inngest,
//   functions: [generateIndustryInsights],
// });

