"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { toast } from "sonner";
import { Input } from "@/app/_components/ui/input";
import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Label } from "@/app/_components/ui/label";
import { useTheme } from "next-themes";

export default function TeamLoginPage() {
  const [teamName, setTeamName] = useState("");
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName.trim()) {
      toast.error("Please enter your team name.");
      return;
    }

    const result = await signIn("team-login", {
      teamName,
      redirect: false,
    });

    if (result?.ok) {
      document.cookie = [
        "flash_success=Login successful!",
        "max-age=10",
        "path=/",
      ].join("; ");
      router.push("/"); // Or "/"
    } else {
      toast.error("Login failed. Please try again.");
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.3,
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.5,
      },
    },
  };

  // Set theme detection
  useState(() => {
    setIsDark(theme === "dark" || resolvedTheme === "dark");
  });

  const logoSrc = isDark ? "/logo.png" : "/logo.png";

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-purple-100 to-orange-100 dark:from-teal-950 dark:via-purple-900 dark:to-orange-1000 flex items-center justify-center px-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="w-full max-w-sm"
      >
        <Card className="mx-auto bg-gradient-to-br from-white to-teal-50 dark:from-gray-900 dark:to-teal-900 shadow-2xl border-0">
          <CardHeader className="text-center pb-6 space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-40 h-16 flex items-center justify-center mb-2"
            >
              <Image
                src={logoSrc}
                alt="Logo"
                width={180}
                height={32}
                className="h-auto w-auto transition-all duration-300"
              />
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
              Team Login
            </CardTitle>
            <CardDescription className="text-base">
              Enter your team name to continue
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <motion.div variants={inputVariants} className="grid gap-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  placeholder="Enter team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="h-11 bg-gradient-to-r from-teal-50 to-purple-50 dark:from-teal-900 dark:to-purple-900 border-2 focus:border-primary transition-all duration-300"
                />
              </motion.div>

              <motion.div variants={buttonVariants}>
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Login
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
