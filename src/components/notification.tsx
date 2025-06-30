"use client"
import { useEffect, useState } from 'react';
import Image from 'next/image';
interface NotificationBellProps {
  username: string;
  role: string;
  userId: number;
}
interface Notification {
  id: string | number;
  title: string;
  message: string;
  isRead: boolean;
}

export function NotificationBell({ username, role, userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const markAsRead = async (id: number) => {
    await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
    });
    setUnreadCount((prev) => Math.max(prev - 1, 0));
    // Optionally update UI after marking read
    setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    };

  // // Socket listene

  useEffect(() => {
    async function fetchNotifications() {
      const res = await fetch(`/api/notifications?username=${username}&role=${role}`);
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    }
    fetchNotifications();
  }, []);

  return (
    <div className="relative">
      <div
        className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <Image src="/announcement.png" alt="notifications" width={20} height={20} />
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-purple-500 text-white rounded-full text-xs flex items-center justify-center">
            {unreadCount}
          </div>
        )}
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-xl z-50 p-3">
            <div className="font-semibold text-gray-800 text-lg mb-2">🔔 Notifications</div>

            <ul className="space-y-3 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                <li
                    key={n.id}
                    onClick={() => markAsRead(Number(n.id))}
                    className={`relative text-sm p-3 rounded-lg cursor-pointer border 
                    ${n.isRead ? "bg-gray-100 border-gray-300" : "bg-purple-100 border-purple-400"}
                    hover:shadow-md transition`}
                >
                    {!n.isRead && (
                    <span className="absolute top-2 right-2 inline-flex h-2 w-2 rounded-full bg-purple-600"></span>
                    )}
                    <div className={`font-semibold ${n.isRead ? "text-gray-700" : "text-purple-800"}`}>
                    {n.title}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{n.message}</div>
                </li>
                ))}
            </ul>

           <div className="text-right mt-3">
                <a href={`/notifications?username=${username}&role=${role}`} className="text-blue-600 text-sm font-medium hover:underline" >
                    View All →
                </a>
            </div>
            </div>
      )}
    </div>
  );
}
