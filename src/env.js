import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  // ✅ Server-only environment variables
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),

    NEXTAUTH_URL:
      process.env.NODE_ENV === "production"
        ? z.string().url()
        : z.string().url().optional(),

    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  // ✅ Client-exposed environment variables (must start with NEXT_PUBLIC_)
  client: {
    // Example: NEXT_PUBLIC_API_BASE: z.string().url()
  },

  // ✅ Actual runtime variables pulled from process.env
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
