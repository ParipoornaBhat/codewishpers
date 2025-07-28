"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlaySettings } from "@/lib/stores/usePlaySettings";
import { useSocket } from "@/lib/hooks/useSocket";
import { motion, AnimatePresence } from "framer-motion";

type LeaderboardEntry = {
  teamId: string;
  teamName: string;
  score: number;
  testCasesPassed: number;
  totalTestCases: number;
  submissions: number;
  submissionTime: string;
  worksheet: any;
};

type LeaderboardResponse = {
  question: {
    title: string;
    description: string;
    code: string;
    difficulty: string;
    startTime: string;
    endTime: string;
    totalTestCases: number;
    totalSubmissions: number;
    totalTeams: number;
  };
  leaderboard: LeaderboardEntry[];
};

const getRankIcon = (rank: number) => <span>🏅</span>;
const formatTime = (iso: string) => new Date(iso).toLocaleTimeString();

const LeaderBoard = () => {

  const [liveStatus, setLiveStatus] = React.useState<"live" | "not-live">("not-live");
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

    socket.emit("joinRoom", questionCode);
    console.log("📡 Joined room:", questionCode);
    setLiveStatus("live");
    const onUpdate = (payload: { questionId: string }) => {
      console.log("🔄 Leaderboard update received:", payload);
      refetch();
    };

    socket.on("leaderboard-update", onUpdate);

    return () => {
      socket.emit("leaveRoom", questionCode);
      setLiveStatus("not-live");
      socket.off("leaderboard-update", onUpdate);
      console.log("🚪 Left room:", questionCode);
    };
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

  const { question, leaderboard } = data;
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
  if (b.testCasesPassed !== a.testCasesPassed) {
    return b.testCasesPassed - a.testCasesPassed;
  }
  return new Date(a.submissionTime).getTime() - new Date(b.submissionTime).getTime();
});

  type WorksheetData = {
   
  nodes: any[];
  edges: any[];
};
  const handleAddWorksheet = (id: number, worksheet: WorksheetData) => {
  const key = `worksheet-sol${id}`;
  const dataToStore = {
    nodes: worksheet.nodes,
    edges: worksheet.edges,
  };

  localStorage.setItem(key, JSON.stringify(dataToStore));
   window.open("/play", "_blank"); // opens in new tab

};

  return (
    <div className={`p-6 ${leaderBoardFullScreen ? "min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white" : ""}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="mb-4">
  <span
    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
      liveStatus === "live"
        ? "bg-green-500 text-white"
        : "bg-gray-400 text-white"
    }`}
  >
    {liveStatus === "live" ? `🔴 Live: ${question.code}` : "⚫ Not Live"}
  </span>
</div>

          <div className="flex-1">
            <h1 className="text-4xl font-bold">
              🧠 {question.title} ({question.code})
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400">
              Difficulty: <span className="font-semibold">{question.difficulty}</span> | Total Test Cases:{" "}
              {question.totalTestCases} | Submissions: {question.totalSubmissions} | Teams: {question.totalTeams}
            </p>
            <p className="text-lg mt-1 text-gray-400">
              Start: {formatTime(question.startTime)} | End: {formatTime(question.endTime)}
            </p>
            <p className="mt-2">{question.description}</p>
          </div>
          <div>
            <Button onClick={toggleFullscreen} variant="outline">
              {leaderBoardFullScreen ? "Exit Fullscreen" : "Fullscreen"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
    
       

                <AnimatePresence>
  {sortedLeaderboard.map((team, idx) => (
    <motion.div
      key={team.teamId}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", duration: 0.5 }}
    >
      <Card
        className={`${leaderBoardFullScreen
          ? "bg-white/10 backdrop-blur border-white/20"
          : "hover:bg-gray-50 dark:hover:bg-gray-800"
        } transition-colors`}
      >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      {getRankIcon(idx + 1)}
                      <div className="text-2xl font-bold">#{idx + 1}</div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{team.teamName}</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span
                          className={`flex items-center gap-1 ${
                            team.testCasesPassed === team.totalTestCases ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          {team.testCasesPassed}/{team.totalTestCases} passed
                        </span>

                        <span className="flex items-center gap-1 text-blue-400">
                          <Clock className="w-4 h-4" />
                          {formatTime(team.submissionTime)}
                        </span>
                        <span className="text-gray-300">{team.submissions} submissions</span>
                      </div>
                    </div>
                  </div>
                 <div className="text-right">
                  <div className="text-3xl font-bold text-yellow-400">{team.score.toFixed(2)}%</div>
                  <Button
                    variant="outline"
                    className="text-sm mt-2"
                    onClick={() => {
                       if (team.worksheet) {
                        handleAddWorksheet(
                          team.submissionId,
                        (team.worksheet as any).worksheet
                        );
                          } else {
                        console.warn("No worksheet data available for submission:", team.submissionId);
                      }
                    }}
                  >
                    View Worksheet
                  </Button>
                </div>    

                </div>
              </CardContent>
            <CardContent className="p-6">
          {/* card content */}
        </CardContent>
      </Card>
    </motion.div>
  ))}
</AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LeaderBoard;