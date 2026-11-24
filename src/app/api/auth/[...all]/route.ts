import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Give auth requests up to 60 seconds — the first database
// connection can be slow on the free Atlas cluster.
export const maxDuration = 60;

export const { GET, POST } = toNextJsHandler(auth.handler);
