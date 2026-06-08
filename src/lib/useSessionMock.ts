import { create } from "zustand";

type MockSessionStore = {
  role: "TEAM" | "ADMIN";
  teamName: string;
  setRole: (role: "TEAM" | "ADMIN") => void;
  setTeamName: (name: string) => void;
};

// Initialize with role: TEAM so users can play by default, but can toggle to ADMIN
export const useMockSessionStore = create<MockSessionStore>((set) => {
  // Load initial settings if in browser
  let initialRole: "TEAM" | "ADMIN" = "TEAM";
  let initialTeamName = "Resume Guest";

  if (typeof window !== "undefined") {
    const savedRole = localStorage.getItem("mock_session_role");
    if (savedRole === "ADMIN" || savedRole === "TEAM") {
      initialRole = savedRole;
    }
    const savedName = localStorage.getItem("mock_session_teamName");
    if (savedName) {
      initialTeamName = savedName;
    }
  }

  return {
    role: initialRole,
    teamName: initialTeamName,
    setRole: (role) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("mock_session_role", role);
      }
      set({ role });
    },
    setTeamName: (teamName) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("mock_session_teamName", teamName);
      }
      set({ teamName });
    },
  };
});

export function useSession() {
  const { role, teamName } = useMockSessionStore();

  return {
    data: {
      user: {
        id: role === "ADMIN" ? "admin_guest" : "team_guest",
        teamName: teamName,
        role: role,
        permissions: role === "ADMIN" ? ["ADMIN"] : [],
      },
      expires: "2099-01-01T00:00:00.000Z",
    },
    status: "authenticated",
    update: async () => {},
  };
}

export async function signOut(options?: any) {
  useMockSessionStore.getState().setRole("TEAM");
  useMockSessionStore.getState().setTeamName("Resume Guest");
  return { url: "/" };
}

export async function getSession() {
  const { role, teamName } = useMockSessionStore.getState();
  return {
    user: {
      id: role === "ADMIN" ? "admin_guest" : "team_guest",
      teamName: teamName,
      role: role,
      permissions: role === "ADMIN" ? ["ADMIN"] : [],
    },
    expires: "2099-01-01T00:00:00.000Z",
  };
}
