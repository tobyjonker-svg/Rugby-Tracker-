import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

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
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
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
