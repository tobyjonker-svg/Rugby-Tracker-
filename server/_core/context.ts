import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { sdk } from "./sdk";

// Inline user type for SQLite preview mode
type User = {
  id: number; openId: string; name: string | null; email: string | null;
  loginMethod: string | null; role: "user" | "admin"; age: number | null;
  position: string | null; height: number | null; weight: number | null;
  dominantFoot: "left" | "right" | "both" | null; team: string | null;
  profilePhotoUrl: string | null; seasonGoals: string | null;
  createdAt: string | Date | null; updatedAt: string | Date | null; lastSignedIn: string | Date | null;
};

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

// PREVIEW MODE mock user — bypasses OAuth entirely
const PREVIEW_USER: User = {
  id: 1,
  openId: "preview-user",
  name: "Preview User",
  email: "preview@sportfitnesstracker.app",
  loginMethod: "preview",
  role: "admin",
  age: null,
  position: null,
  height: null,
  weight: null,
  dominantFoot: null,
  team: null,
  profilePhotoUrl: null,
  seasonGoals: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastSignedIn: new Date().toISOString(),
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // PREVIEW MODE: skip real auth, always use mock user
  return {
    req: opts.req,
    res: opts.res,
    user: PREVIEW_USER,
  };
}
