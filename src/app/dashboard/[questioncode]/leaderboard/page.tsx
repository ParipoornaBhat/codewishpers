"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlaySettings } from "@/lib/stores/usePlaySettings";
import { useSocket } from "@/lib/hooks/useSocket";

// ✅ Data Types
type LeaderboardEntry = {
  rank: number;
  teamName: string;
  score: number;
  testCasesPassed: number;
  totalTestCases: number;
  submissions: number;
  submissionTime: string;
};

type LeaderboardResponse = {
  questionTitle: string;
  leaderboard: LeaderboardEntry[];
};

// Dummy utils for icon and time (replace with yours)
const getRankIcon = (rank: number) => <span>🏅</span>;
const formatTime = (iso: string) => new Date(iso).toLocaleTimeString();

const LeaderBoard = () => {

  const { leaderBoardFullScreen, setLeaderBoardFullScreen } = usePlaySettings();
  const params = useParams();
  const questionCode = params?.questioncode as string;

  const { data, isLoading, refetch } = api.leaderboard.getLeaderboard.useQuery(
    { questionCode },
    { enabled: !!questionCode }
  );

const { socket, connected } = useSocket();

useEffect(() => {
  if (!questionCode || !connected || !socket) return;

  try {
    socket.emit("joinRoom", questionCode);
    console.log("📡 Joined room:", questionCode);

    const onUpdate = (payload: { questionId: string }) => {
      console.log("🔄 Socket:Leaderboard update received:", payload);
      refetch();
    };

    socket.on("leaderboard-update", onUpdate);

    return () => {
      try {
        socket.emit("leaveRoom", questionCode);
        socket.off("leaderboard-update", onUpdate);
        console.log("🚪 Left room:", questionCode);
      } catch (err) {
        console.warn("⚠️ Error leaving room:", err);
      }
    };
  } catch (err) {
    console.warn("⚠️ Socket emit error:", err);
  }
}, [questionCode, connected, socket, refetch]);


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

  if (isLoading) return <div className="text-center py-10">Loading leaderboard...</div>;
  if (!data) return <div className="text-center py-10 text-red-500">No data found.</div>;

  const { questionTitle, leaderboard } = data;

  if (leaderBoardFullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                🏆 {questionTitle} 🏆
              </h1>
              <p className="text-2xl text-blue-200">Question {questionCode} - Live Rankings</p>
            </div>
            <Button onClick={toggleFullscreen} variant="outline" className="text-white border-white bg-transparent">
              Exit Fullscreen
            </Button>
          </div>

          <div className="space-y-4">
            {leaderboard.map((team) => (
              <Card key={team.teamName} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        {getRankIcon(team.rank)}
                        <div className="text-4xl font-bold">#{team.rank}</div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{team.teamName}</h3>
                        <div className="flex items-center gap-4 text-lg">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            {team.testCasesPassed}/{team.totalTestCases} Test Cases
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-5 h-5 text-blue-400" />
                            {formatTime(team.submissionTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-yellow-400">{team.score}%</div>
                      <div className="text-lg text-gray-300">{team.submissions} submissions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          {questionTitle} Rankings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboard.map((team) => (
            <div
              key={team.teamName}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getRankIcon(team.rank)}
                  <span className="text-xl font-bold">#{team.rank}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{team.teamName}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {team.testCasesPassed}/{team.totalTestCases} passed
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-blue-500" />
                      {formatTime(team.submissionTime)}
                    </span>
                    <span>{team.submissions} submissions</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{team.score}%</div>
                <div className="text-sm text-gray-500">
                  {team.testCasesPassed === team.totalTestCases ? "Perfect!" : "Partial"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderBoard;
