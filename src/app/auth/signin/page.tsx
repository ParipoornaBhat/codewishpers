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
import { adminAccountsFrontend as adminAccounts } from "@/lib/admin"; // ✅ import admin metadata

export default function TeamLoginPage() {
  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useState(() => {
    setIsDark(theme === "dark" || resolvedTheme === "dark");
  });

  const logoSrc = isDark ? "/logo.png" : "/logo.png";

  const checkIfAdmin = (name: string) => {
    return adminAccounts.some((admin) => admin.id === name.trim());
  };

  const handleCheckAndLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!teamName.trim()) {
    toast.error("Please enter your team name.");
    return;
  }

  const isAdminLogin = checkIfAdmin(teamName);
  setIsAdmin(isAdminLogin);

  if (!isAdminLogin) {
    try {
      const result = await signIn("team-login", {
        teamName,
        redirect: false,
      });

      if (result?.error === "CredentialsSignin") {
        toast.error("Invalid team name. Please try again.");
      } else if (result?.ok) {
        document.cookie = [
          "flash_success=Login successful!",
          "max-age=10",
          "path=/",
        ].join("; ");
        router.push("/play");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } catch (err) {
      toast.error("Something went wrong while signing in.");
    }
  }
};


  const handleAdminLogin = async () => {
  if (!password.trim()) {
    toast.error("Please enter your password.");
    return;
  }

  signIn("admin-login", {
    userId: teamName,
    password,
    redirect: false,
  })
    .then((result) => {
      if (result?.error === "CredentialsSignin") {
        toast.error("Invalid admin ID or password. Please try again.");
      } else if (result?.ok) {
        document.cookie = [
          "flash_success=Admin login successful!",
          "max-age=10",
          "path=/",
        ].join("; ");
        router.push("/");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    })
    .catch(() => {
      toast.error("Something went wrong while signing in.");
    });
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-purple-100 to-orange-100 dark:from-teal-950 dark:via-purple-900 dark:to-orange-1000 flex items-center justify-center px-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 50, scale: 0.9 },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.8, ease: "easeOut", type: "spring", stiffness: 100 },
          },
        }}
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
              <Image src={logoSrc} alt="Logo" width={180} height={32} />
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
              Team  Login
            </CardTitle>
            <CardDescription className="text-base">
              Enter your team name
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCheckAndLogin} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
                className="grid gap-2"
              >
                <Label htmlFor="teamName">Team </Label>
                <Input
                  id="teamName"
                  placeholder="Enter ID"
                  value={teamName}
                  onChange={(e) => {
                    setTeamName(e.target.value);
                    setIsAdmin(false);
                    setPassword("");
                  }}
                />
              </motion.div>

              {!isAdmin ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, transition: { delay: 0.5 } }}
                >
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-teal-500 to-purple-500 text-white shadow-lg hover:scale-105 transition"
                  >
                    Team Login
                  </Button>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                    className="grid gap-2"
                  >
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </motion.div>
                  <Button
                    type="button"
                    onClick={handleAdminLogin}
                    className="w-full h-11 bg-gradient-to-r from-purple-600 to-teal-600 text-white hover:scale-105 transition"
                  >
                    Admin Sign In
                  </Button>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
