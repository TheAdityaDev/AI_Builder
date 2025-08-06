import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";
import { Suspense } from "react";
import Loader from "./Loader";

const inter = Inter({ subsets: ["latin"] });
export const metadata = {
  title: "Sensai - AI Career Coach",
  description: "Your personal AI career coach and mentor",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
             <Suspense fallback={<Loader />}>
            {/* Header */}
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors position="top-center" />
            <footer className="bg-muted/50 py-12">
              <div className="container mx-auto px-4 text-center text-gray-200">
                <p>
                  All rights Reserved &copy; ❤️❤️ Made By{" "}
                  <span className="bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 text-transparent bg-clip-text font-bold">
                    Aditya
                  </span>
                </p>
              </div>
            </footer>
          </Suspense>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
    );
}
