// hooks/useNotificationSocket.ts
import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_BASE_URL); // change to your backend URL

export function useNotificationSocket(userId: number, onNewNotification: (data: any) => void) {
  useEffect(() => {
    if (!userId) return;
    socket.emit("join", userId);

    socket.on("new-notification", (data) => {
      console.log("🔔 New notification received", data);
      onNewNotification(data);
    });

    return () => {
      socket.off("new-notification");
    };
  }, [userId]);
}
