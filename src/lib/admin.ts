// /lib/admin.ts

// Full admin data structure (used in backend login logic)
export type AdminAccount = {
  id: string;
  teamName: string;
  password: string;
  role: "ADMIN";
  permissions: string[];
};

// Exported list for backend (with password)
export const adminAccounts: AdminAccount[] = [
  {
    id: "admin1",
    teamName: "Super Admin Team",
    password: "123123",
    role: "ADMIN",
    permissions: ["ALL_ACCESS"],
  },
  {
    id: "admin2",
    teamName: "Operations Admin",
    password: "123123",
    role: "ADMIN",
    permissions: ["ALL_ACCESS"],
  },
  {
    id: "admin3",
    teamName: "Support Moderator",
    password: "123123",
    role: "ADMIN",
    permissions: ["ALL_ACCESS"],
  },
];

//  Safe export for frontend (password removed)
export const adminAccountsFrontend = adminAccounts.map(({ password, ...rest }) => rest);
