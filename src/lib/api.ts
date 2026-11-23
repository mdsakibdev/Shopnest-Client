import { authClient } from "./auth-client";

// Address of the Express server
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

// Get the logged-in user's token.
// Admin API calls send this token, the server checks it and the role.
export async function getToken() {
  const result = await authClient.token();
  return result.data?.token || "";
}
