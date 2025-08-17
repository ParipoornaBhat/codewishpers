"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ComponentLoading } from "@/app/_components/component-loading2";
import { Button } from "@/components/ui/button";
import { usePlaySettings } from "@/lib/stores/usePlaySettings";
import { useSocket } from "@/lib/hooks/useSocket";
import Link from "next/link";

const OverallLeaderboard = () => {
  const { leaderBoardFullScreen, setLeaderBoardFullScreen } = usePlaySettings();
  const { socket, connected } = useSocket();

  const { data, isLoading, refetch } =
    api.leaderboard.getOverallLeaderboard.useQuery();

  const [liveStatus, setLiveStatus] = useState<"live" | "not-live">("not-live");

  // 🔄 Socket live updates
  const Room = `overall`;
  useEffect(() => {
    if (!Room || !connected || !socket) return;

    socket.emit("joinRoom", Room);
    console.log("📡 Joined room:", Room);
    setLiveStatus("live");
    const onUpdate = (payload: { questionId: string }) => {
      console.log("🔄 Leaderboard update received:", payload);
      refetch();
    };

    socket.on("leaderboard-update", onUpdate);

    return () => {
      socket.emit("leaveRoom", Room);
      setLiveStatus("not-live");
      socket.off("leaderboard-update", onUpdate);
      console.log("🚪 Left room:", Room);
    };
  }, [Room, connected, socket, refetch]);


  // ⛶ Toggle fullscreen
  const toggleFullscreen = () => {
    if (setLeaderBoardFullScreen) {
      setLeaderBoardFullScreen(!leaderBoardFullScreen);
    }
    if (!leaderBoardFullScreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  if (isLoading) return <ComponentLoading message="Loading Leaderboard..." />;
  if (!data)
    return (
      <div className="text-center py-10 text-red-500">No data found.</div>
    );

  return (
    <div
      className={`p-6 ${
        leaderBoardFullScreen
          ? "min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white"
          : ""
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                liveStatus === "live"
                  ? "bg-green-500 text-white"
                  : "bg-gray-400 text-white"
              }`}
            >
              {liveStatus === "live" ? "🔴 Live" : "⚫ Not Live"}
            </span>
            <h1 className="text-4xl font-bold mt-2 flex items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" /> Overall Leaderboard
            </h1>
          </div>
          <Button onClick={toggleFullscreen} variant="outline">
            {leaderBoardFullScreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
        </div>

        {/* Leaderboard list */}
        <AnimatePresence>
          {data.map((team) => (
            <motion.div
              key={team.teamId}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <Card
                className={`mb-4 ${
                  leaderBoardFullScreen
                    ? "bg-white/10 backdrop-blur border-white/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                } transition-colors`}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">
                        #{team.overallRank} {team.teamName}
                      </h2>
                      <p
                        className={`font-semibold ${
                          leaderBoardFullScreen
                            ? "text-yellow-300"
                            : "text-yellow-500"
                        }`}
                      >
                        Total Points: {team.totalPoints}
                      </p>
                    </div>
                  </div>

                  {/* Question badges */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {team.questionStats.map((q) => (
                         <Link
                            key={q.questionId}
                            href={`/dashboard/leaderboard/q/${q.questionCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                      <Badge
                        key={q.questionId}
                        variant="outline"
                        className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full ${
                          leaderBoardFullScreen
                            ? "bg-white/20 text-white border-white/30"
                            : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        <span className="font-semibold">{q.questionCode}</span>
                        {q.rankInQuestion && (
                          <span className="text-blue-500">
                            #{q.rankInQuestion}
                          </span>
                        )}
                        <span
                          className={
                            leaderBoardFullScreen
                              ? "text-green-300"
                              : "text-green-600"
                          }
                        >
                          {q.testCasesPassed}/{q.totalTestCases} (
                          {q.score.toFixed(0)}%)
                        </span>
                        <span
                          className={
                            leaderBoardFullScreen
                              ? "text-yellow-300 font-semibold"
                              : "text-yellow-600 font-semibold"
                          }
                        >
                          +{q.points}
                        </span>
                      </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OverallLeaderboard;
