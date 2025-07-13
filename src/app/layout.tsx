"use client";

import "@/styles/globals.css";
import { ThemeProvider } from "@/app/_components/ui/theme";
import { Footer } from "@/app/_components/footer";
import { Navbar } from "@/app/_components/navbar";

import { TRPCReactProvider } from "@/trpc/react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { FlashToast } from "@/app/_components/Flash-error";
export default function RootLayout({
  children,
  session, // Receiving session prop
}: Readonly<{ children: React.ReactNode, session: any }>) {
  return (
    
     <html lang="en" suppressHydrationWarning>
       <head>
        <title>Dynamic Packaging | Tumkur, Karnataka, India | Packaging |</title>
        <link rel="icon" href="/logo.png" type="image/png" />
        {/* You can also add meta tags here if needed */}
      </head>
      <body >
        
        <TRPCReactProvider>
          <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="flex min-h-screen flex-col">
              
              <Navbar /> {/* Passing session to Navbar */}
              <main className="flex-1">{children}</main>
              
                <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              className: "mt-11 sm:mt-11 md:mt-10  bg-white text-gray-800 shadow-lg dark:bg-gray-800 dark:text-gray-200",
              style: {
                borderRadius: "8px",
                padding: "16px",
                fontSize: "14px",
              },
            }}
          />
          <FlashToast />
              <Footer />
            </div>
          </ThemeProvider>
          </SessionProvider>
        </TRPCReactProvider>
      </body>
    </html>
    
  );
}
