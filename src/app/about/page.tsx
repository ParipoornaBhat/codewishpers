"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockSessionStore } from "@/lib/useSessionMock";
import { 
  ArrowRight, Cpu, Database, Award, Code, CheckCircle, RefreshCw, 
  Calendar, Users, Network, Target, Award as CupIcon, Briefcase,
  BookOpen, Terminal, Settings, Play, Image as ImageIcon
} from "lucide-react";

type TabType = "showcase" | "setup";

export default function AboutShowcasePage() {
  const { setRole } = useMockSessionStore();
  const [activeTab, setActiveTab] = useState<TabType>("showcase");
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleImgError = (id: string) => {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  };

  const eventPics = [
    { id: "pic1", src: "/flc/pic1.jpg", alt: "Code Whisperer Launch", title: "Launch & LAN Setup", caption: "Busting bugs and staging the local server before the event." },
    { id: "pic2", src: "/flc/pic2.jpg", alt: "Teams Competing", title: "20+ Teams in Round 2", caption: "Participants wiring visual node solutions concurrently over the LAN network." },
    { id: "pic3", src: "/flc/pic3.jpg", alt: "Core Tech Team", title: "Organizing Committee", caption: "The Finite Loop Club operations and technical core teams running the contest." }
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-purple-50/30 to-teal-50/30 dark:from-gray-950 dark:via-purple-950/10 dark:to-teal-950/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Hero Section */}
        <div className="text-center space-y-4">
          <Badge className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-sm font-semibold rounded-full">
            Featured Portfolio Project
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-teal-600 dark:from-purple-400 dark:to-teal-400">
            Code Whisperer — Contest Hub
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
            NMAMIT's premier coding community, Finite Loop Club, event details, and the platform technical documentation.
          </p>
        </div>

        {/* GitHub Repository Banner */}
        <Card className="border border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-500/10 to-teal-500/10 backdrop-blur-sm shadow-sm">
          <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left flex-1">
              <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 flex items-center justify-center sm:justify-start gap-2">
                <Code className="text-purple-600 dark:text-purple-400 w-5 h-5" />
                Source Code & Custom Branch
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This deployment runs on a customized <code className="bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 px-1 py-0.5 rounded font-semibold text-xs">public</code> branch, pre-configured for offline preview, database-free execution, and recruiter interaction. You can view the original production database architecture on the <code className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1 py-0.5 rounded font-semibold text-xs">dev</code> and <code className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1 py-0.5 rounded font-semibold text-xs">main</code> branches.
              </p>
            </div>
            <a 
              href="https://github.com/ParipoornaBhat/codewishpers" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto shrink-0"
            >
              <Button className="w-full bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold flex items-center justify-center gap-2 px-5 py-2.5">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                View Repository
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Dynamic Tab Switcher */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab("showcase")}
            className={`flex items-center gap-2 py-3 px-6 font-bold text-sm border-b-2 transition-colors duration-200 ${
              activeTab === "showcase"
                ? "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <Award className="w-4 h-4" />
            Event Showcase
          </button>
          <button
            onClick={() => setActiveTab("setup")}
            className={`flex items-center gap-2 py-3 px-6 font-bold text-sm border-b-2 transition-colors duration-200 ${
              activeTab === "setup"
                ? "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Platform Setup Guide (Original build)
          </button>
        </div>

        {/* Tab content 1: Event Showcase */}
        {activeTab === "showcase" && (
          <div className="space-y-12">
            {/* Real-World Event Deployment & Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-purple-100 dark:border-purple-900 shadow-sm bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <CardContent className="pt-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center mx-auto text-teal-600 dark:text-teal-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">20+ Teams</h3>
                  <p className="text-sm font-semibold text-teal-600 dark:text-teal-400">Round 2 Contestants</p>
                  <p className="text-xs text-muted-foreground">Active teams logging in simultaneously to solve node chaining puzzles.</p>
                </CardContent>
              </Card>

              <Card className="border border-purple-100 dark:border-purple-900 shadow-sm bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <CardContent className="pt-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400">
                    <Network className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">LAN Host</h3>
                  <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">Local Area Network</p>
                  <p className="text-xs text-muted-foreground">Platform was hosted locally on a college LAN server to ensure lag-free node executions.</p>
                </CardContent>
              </Card>

              <Card className="border border-purple-100 dark:border-purple-900 shadow-sm bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <CardContent className="pt-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Top 8</h3>
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Promoted to Finals</p>
                  <p className="text-xs text-muted-foreground">The highest scoring 8 teams on the live leaderboard advanced to the Round 3 finals.</p>
                </CardContent>
              </Card>
            </div>

            {/* Leadership Journey Timeline */}
            <Card className="border border-purple-100 dark:border-purple-900 shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Briefcase className="text-purple-600 dark:text-purple-400" />
                  My Leadership Journey at Finite Loop Club
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  <strong>Finite Loop Club (FLC)</strong> is NMAMIT's premier coding community, dedicated to realizing ideas through hackathons, technical workshops, and peer-to-peer mentoring. Over the course of the 2025-26 academic year, my involvement grew from pure technical engineering to club operations and executive leadership:
                </p>

                <div className="relative border-l-2 border-purple-300 dark:border-purple-700 ml-4 pl-6 space-y-8">
                  
                  {/* Timeline Item 1 */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-purple-600 border-2 border-white dark:border-gray-900"></div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Start of Academic Year 2025-26
                        </span>
                        <Badge variant="outline" className="border-purple-200 text-purple-700 dark:text-purple-300">Core Tech Developer</Badge>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Developer — Core Tech Team</h4>
                      <p className="text-sm text-muted-foreground">
                        Developed the initial system architecture for Code Whisperer, focused on building the visual node graph parser, custom testing panel, and locally cached visual graph compiler running on top of tRPC procedures.
                      </p>
                    </div>
                  </div>

                  {/* Timeline Item 2 */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-teal-600 border-2 border-white dark:border-gray-900"></div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> November 2025
                        </span>
                        <Badge variant="outline" className="border-teal-200 text-teal-700 dark:text-teal-300">Operations Manager</Badge>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Operations Manager — Administrative Team</h4>
                      <p className="text-sm text-muted-foreground">
                        Promoted to manage administrative logistics. Coordinated LAN server configurations, database seed orchestration, staging platforms, and guided our operations volunteers to guarantee smooth live execution during tournaments.
                      </p>
                    </div>
                  </div>

                  {/* Timeline Item 3 */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white dark:border-gray-900"></div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-amber-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> January 2026
                        </span>
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Vice President</Badge>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Vice President of Finite Loop Club</h4>
                      <p className="text-sm text-muted-foreground">
                        Elected Vice President of the club. Took charge of steering academic and technical coding programs, managing the executive board, scaling club reach, and mentoring the incoming batch of core developer and administrative members.
                      </p>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Gallery / Image Grid */}
            <Card className="border border-purple-100 dark:border-purple-900 shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <ImageIcon className="text-purple-600 dark:text-purple-400" />
                  Event Gallery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {eventPics.map((pic) => (
                    <div key={pic.id} className="group flex flex-col space-y-2 border dark:border-gray-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-gray-900/50 p-2 shadow-sm transition-transform duration-300 hover:scale-[1.02]">
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-200 dark:bg-gray-800 flex items-center justify-center">
                        {imgErrors[pic.id] ? (
                          <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
                            <ImageIcon className="w-8 h-8 mb-1 text-gray-400" />
                            <span className="text-xs text-center font-medium">Image: {pic.src}</span>
                            <span className="text-[10px] text-center text-gray-400 mt-1">Add photos to public/flc/ folder to display</span>
                          </div>
                        ) : (
                          <img
                            src={pic.src}
                            alt={pic.alt}
                            className="object-cover w-full h-full"
                            onError={() => handleImgError(pic.id)}
                          />
                        )}
                      </div>
                      <div className="px-2 pb-2">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{pic.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{pic.caption}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Features Info Table */}
            <Card className="border border-purple-100 dark:border-purple-900 shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Database className="text-teal-600 dark:text-teal-400" />
                  Interactive Demo Details (Offline Conversion)
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b dark:border-gray-800">
                      <th className="py-3 px-4 font-bold text-gray-700 dark:text-gray-300">Feature</th>
                      <th className="py-3 px-4 font-bold text-purple-600 dark:text-purple-400">Tournament Build</th>
                      <th className="py-3 px-4 font-bold text-teal-600 dark:text-teal-400">Offline Resume Demo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-muted-foreground">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Database Layer</td>
                      <td className="py-3 px-4">PostgreSQL + Prisma ORM (Live DB connections)</td>
                      <td className="py-3 px-4 text-teal-600 dark:text-teal-400 font-semibold bg-teal-50/30 dark:bg-teal-950/10">Local Storage database (Worksheets & Submissions)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Authentication</td>
                      <td className="py-3 px-4">Next-Auth Credentials (secure credentials DB verification)</td>
                      <td className="py-3 px-4 text-teal-600 dark:text-teal-400 font-semibold bg-teal-50/30 dark:bg-teal-950/10">Interactive Mock Session Switcher (Admin vs Team)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Code Evaluation</td>
                      <td className="py-3 px-4">Server-side execution nodes via tRPC procedures</td>
                      <td className="py-3 px-4 text-teal-600 dark:text-teal-400 font-semibold bg-teal-50/30 dark:bg-teal-950/10">Instant client-side pure JS execution in browser</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Leaderboard updates</td>
                      <td className="py-3 px-4">Real-time Node/Express WebSocket server syncing ranks</td>
                      <td className="py-3 px-4 text-teal-600 dark:text-teal-400 font-semibold bg-teal-50/30 dark:bg-teal-950/10">Simulated real-time ranking against pre-seeded opponent teams</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Try-it guide */}
            <Card className="border border-purple-100 dark:border-purple-900 shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <CupIcon className="text-purple-600 dark:text-purple-400" />
                  Explore the Sandbox
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-3 p-4 rounded-xl border dark:border-gray-800 bg-teal-50/20 dark:bg-teal-950/5">
                    <h3 className="text-lg font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                      <CheckCircle className="w-5 h-5" />
                      1. Solve Challenges
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Switch to <strong>Team Mode</strong>. Navigate to the Round 2 page, enter a question code (like <code className="bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 px-1 py-0.5 rounded font-semibold">Q001</code> to <code className="bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 px-1 py-0.5 rounded font-semibold">Q009</code>) in the left panel to load a puzzle, and build your visual graph to solve it!
                    </p>
                    <Button
                      size="sm"
                      onClick={() => {
                        setRole("TEAM");
                        window.location.href = "/play";
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white w-full"
                    >
                      Enter Play Mode <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3 p-4 rounded-xl border dark:border-gray-800 bg-purple-50/20 dark:bg-purple-950/5">
                    <h3 className="text-lg font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                      <Code className="w-5 h-5" />
                      2. Admin Controls
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Switch to <strong>Admin Mode</strong>. Visit the Dashboard where you can view all active questions, edit titles/descriptions, alter test cases, delete entries, or fully reset the local database.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => {
                        setRole("ADMIN");
                        window.location.href = "/dashboard";
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white w-full"
                    >
                      Enter Admin Mode <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>

                </div>

                <div className="p-4 rounded-xl border border-dashed dark:border-gray-800 text-center space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-1.5">
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-500" />
                    Real-Time Leaderboard Simulation
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                    Go to the <strong>Leaderboard</strong> page. Submit a solution to see your team climb the ranks! The leaderboard calculates points for correct solutions dynamically, ordering teams by test cases passed and time.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab content 2: Platform Setup Guide */}
        {activeTab === "setup" && (
          <div className="space-y-8">
            <Card className="border border-purple-100 dark:border-purple-900 shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Terminal className="text-purple-600 dark:text-purple-400" />
                  Contest Platform Setup Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-muted-foreground">
                <p>
                  To set up and run the platform in its original multi-player tournament configuration (e.g. database-backed with WebSockets for the live event), follow this documentation.
                </p>

                {/* Section 1 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold">1</span>
                    Installation & Environment Configuration
                  </h3>
                  <p className="text-sm">
                    First, clone the repository, install dependencies, and configure the local environment settings:
                  </p>
                  <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto space-y-1">
                    <div># Install node packages</div>
                    <div className="text-green-400">npm install</div>
                    <div className="pt-2"># Copy and configure the environmental values</div>
                    <div className="text-green-400">cp .env.example .env</div>
                  </pre>
                  <p className="text-xs">
                    In your <code className="bg-muted px-1 rounded">.env</code> file, configure a PostgreSQL database URL and Next-Auth secret key:
                  </p>
                  <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto">
                    DATABASE_URL="postgresql://user:password@localhost:5432/codewhispers?schema=public"<br />
                    AUTH_SECRET="your-next-auth-secret-key-here"<br />
                    SOCKET_URL="http://localhost:3003"<br />
                    NEXT_PUBLIC_SOCKET_URL="http://localhost:3003"
                  </pre>
                </div>

                {/* Section 2 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold">2</span>
                    Database Setup & Seeding
                  </h3>
                  <p className="text-sm">
                    Generate the Prisma client types, deploy the PostgreSQL schemas, and seed default teams and questions:
                  </p>
                  <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto space-y-1">
                    <div># Generate prisma schema classes</div>
                    <div className="text-green-400">npx prisma generate</div>
                    <div className="pt-2"># Deploy tables directly to database</div>
                    <div className="text-green-400">npx prisma db push</div>
                    <div className="pt-2"># Seed the teams list from seed file</div>
                    <div className="text-green-400">npx prisma db seed</div>
                  </pre>

                  <div className="bg-slate-50 dark:bg-gray-900/50 p-4 rounded-lg border border-dashed dark:border-gray-800 text-xs space-y-2 mt-2">
                    <p>
                      <strong>Seeding Teams:</strong> The teams list is populated from the seed script at <code className="text-purple-600 dark:text-purple-400">prisma/seed.ts</code>, defining pre-registered passwords and names.
                    </p>
                    <p>
                      <strong>Seeding Questions:</strong> Questions and their respective hidden and visible test cases are defined statically inside <code className="text-purple-600 dark:text-purple-400">src/lib/QuestionMeta.ts</code>. During construction or reset, the Admin Panel triggers a tRPC procedure to clear tables and bulk insert entries from the static file into the PostgreSQL schema.
                    </p>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold">3</span>
                    Visual Functions Mapping
                  </h3>
                  <p className="text-sm">
                    Custom visual canvas blocks require synchronization between the frontend and backend.
                  </p>
                  <ul className="list-disc pl-5 text-sm space-y-2">
                    <li>
                      <strong>Frontend Configuration:</strong> Declared in <code className="text-purple-600 dark:text-purple-400">src/lib/functionMeta.ts</code>, which defines the node ID, display category, input/output types, and descriptions for the canvas interface.
                    </li>
                    <li>
                      <strong>Backend Executions:</strong> Mapped to tRPC mutations inside <code className="text-purple-600 dark:text-purple-400">src/server/api/routers/function.ts</code> (Round 2 visual calculations) and <code className="text-purple-600 dark:text-purple-400">src/server/api/routers/R1.ts</code> (Round 1 sandbox).
                    </li>
                  </ul>
                </div>

                {/* Section 4 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold">4</span>
                    Running the Application
                  </h3>
                  <p className="text-sm">
                    In a multi-user tournament environment, both the Next.js web application and the WebSocket syncing server must be run concurrently:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1"><Play className="w-3 h-3 text-purple-500" /> Web App Server (Next.js)</p>
                      <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono">
                        # Run development server<br />
                        <span className="text-green-400">npm run dev</span><br /><br />
                        # Build and run production<br />
                        <span className="text-green-400">npm run build</span><br />
                        <span className="text-green-400">npm run start</span>
                      </pre>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1"><Play className="w-3 h-3 text-teal-500" /> Sync Socket Server (WebSockets)</p>
                      <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono">
                        # Spin up node websocket server<br />
                        <span className="text-green-400">npm run socket</span>
                      </pre>
                      <p className="text-[10px] text-muted-foreground pt-1">
                        Handles broadcasting leaderboard changes instantly when contestants submit correct node graphs.
                      </p>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}