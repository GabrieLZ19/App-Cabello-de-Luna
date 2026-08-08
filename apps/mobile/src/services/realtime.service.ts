import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "./config";
import { storage } from "./storage";

let socket: Socket | null = null;

function getSocketBaseUrl() {
  return API_BASE_URL.replace(/\/api\/v1\/?$/, "");
}

export type PracticeReviewedPayload = {
  cutId: string;
  cutNumber: number;
  status: "APPROVED" | "CORRECTION_REQUIRED";
  comments?: string;
  title: string;
  body: string;
};

export async function connectRealtimeSocket(handlers?: {
  onPracticeReviewed?: (payload: PracticeReviewedPayload) => void;
}) {
  const token = await storage.getToken();
  if (!token) return null;

  if (socket?.connected) {
    return socket;
  }

  socket?.disconnect();
  socket = io(`${getSocketBaseUrl()}/realtime`, {
    auth: { token },
    transports: ["websocket", "polling"],
  });

  if (handlers?.onPracticeReviewed) {
    socket.on("practice:reviewed", handlers.onPracticeReviewed);
  }

  return socket;
}

export function disconnectRealtimeSocket() {
  socket?.disconnect();
  socket = null;
}
