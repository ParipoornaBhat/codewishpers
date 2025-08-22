"use client";

import Link from "next/link";
import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();
  const role = session?.user.role;
  const teamName = session?.user.teamName;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
      },
    },
  };

  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    
  }, [theme, resolvedTheme]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-teal-100 via-purple-100 to-orange-100 dark:from-teal-950 dark:via-purple-900 dark:to-orange-1000 relative">
      <motion.div
        className="relative z-20 flex flex-col items-center justify-center px-4 py-12 md:py-24 lg:py-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl text-center space-y-6">
          <motion.h1
            className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl 
              bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-purple-200 to-amber-300 
              dark:bg-gradient-to-r dark:from-teal-600 dark:via-purple-600 dark:to-amber-600"
            variants={itemVariants}
          >
            Code Whisperer - Round 2
          </motion.h1>
          <motion.p
            className="text-lg text-muted-foreground md:text-xl"
            variants={itemVariants}
          >
            Finite Loop Club | NMAMIT<br />
            Welcome {teamName ? `Team ${teamName}` : "Participant"} 👋
          </motion.p>

          <motion.div
            className="flex flex-col gap-4 sm:flex-row justify-center mt-6"
            variants={itemVariants}
          >
            {!session && (
              <Link href="/auth/signin">
                <Button
                  size="lg"
                  className="bg-blue-600 text-white rounded-lg py-3 px-6 transition-all duration-300 hover:bg-blue-700 hover:shadow-md"
                >
                  Login as Team
                </Button>
              </Link>
            )}

            {session && role === "TEAM" && (
              <Link href="/play">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-green-600 text-green-600 rounded-lg py-3 px-6 transition-all duration-300 hover:bg-green-600 hover:text-white hover:border-green-700"
                >
                  Play Round 2
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
