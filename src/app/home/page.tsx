"use client";

import Link from "next/link";
import { Button } from "@/app/_components/ui/button";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useSession, useMockSessionStore } from "@/lib/useSessionMock";

export default function HomePage() {
  const { data: session } = useSession();
  const { setRole } = useMockSessionStore();
  const teamName = session?.user?.teamName;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      y: -4,
      transition: {
        duration: 0.2,
      },
    },
  };

  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {}, [theme, resolvedTheme]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 relative overflow-hidden">
      {/* Decorative gradient glow background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <motion.div
        className="max-w-4xl w-full z-10 space-y-12 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Public Portfolio Preview Badge */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-900/30 shadow-sm">
            ✨ Interactive Portfolio Preview
          </span>
        </motion.div>

        {/* Platform Title */}
        <div className="space-y-4">
          <motion.h1
            className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Code Whisperer
          </motion.h1>
          <motion.p
            className="text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            An interactive, visual programming platform where teams build code pipelines by chaining functional nodes. Created for Finite Loop Club's flagship coding event.
          </motion.p>
        </div>

        {/* Navigation Selector Cards */}
        <motion.div
          className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto pt-2"
          variants={itemVariants}
        >
          {/* Card 1: Participant Mode */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="flex flex-col justify-between p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all text-left"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-lg">
                🚀
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Participant Mode</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Play as a contestant. Open a challenge, connect visual code blocks, run inputs locally, and submit solutions to view your team's live ranking.
              </p>
            </div>
            <div className="pt-6">
              <Button
                onClick={() => {
                  setRole("TEAM");
                  window.location.href = "/play";
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 font-medium transition-colors cursor-pointer"
              >
                Enter Playground
              </Button>
            </div>
          </motion.div>

          {/* Card 2: Admin Dashboard */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="flex flex-col justify-between p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all text-left"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 text-lg">
                🛡️
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Explore contest management. Dynamically create/edit questions, customize test cases, review participant history, and manage team standings.
              </p>
            </div>
            <div className="pt-6">
              <Button
                onClick={() => {
                  setRole("ADMIN");
                  window.location.href = "/dashboard";
                }}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-2.5 font-medium transition-colors cursor-pointer"
              >
                Enter Dashboard
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer Info */}
        <motion.p
          className="text-xs text-slate-400 dark:text-slate-600 pt-6"
          variants={itemVariants}
        >
          Designed and built by Finite Loop Club • Vice President & Tech Core Developer
        </motion.p>
      </motion.div>
    </div>
  );
}
