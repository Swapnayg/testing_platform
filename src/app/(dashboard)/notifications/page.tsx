"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Notification = {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
};

export default function NotificationsPage() {
  const searchParams = useSearchParams();
  const username = searchParams?.get("username") || "";
  const role = searchParams?.get("role") || "";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const take = 10;
  const totalPages = Math.ceil(total / take);

  const loadNotifications = async () => {
    const res = await fetch(
      `/api/notifications/all?username=${username}&role=${role}&status=${status}&page=${page}`
    );
    const data = await res.json();
    setNotifications(data.notifications);
    setTotal(data.total);
    setUnreadCount(data.unreadCount); // ✅ This line is essential
  };

  useEffect(() => {
  if (username && role) {
    loadNotifications();
  }
}, [username, role, status, page]);


  const markAsRead = async (id: number) => {
    await fetch(`/api/notifications/read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });

    await loadNotifications(); // 🔁 Reload fresh data

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = async () => {
    await fetch(`/api/notifications/mark-all-read`, {
      method: "PATCH",
      body: JSON.stringify({ username, role }),
    });

    await loadNotifications(); // 🔁 Reload fresh data

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="w-full px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">All Notifications</h1>
        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md shadow transition 
            ${unreadCount === 0 
              ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
              : "bg-purple-600 text-white hover:bg-purple-700"}
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Mark all as read
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {["all", "unread", "read"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-md border ${
              status === s ? "bg-purple-600 text-white" : "bg-gray-100"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <ul className="space-y-3">
        {notifications.map((n) => (
          <li
            key={n.id}
            onClick={() => markAsRead(n.id)}
            className={`p-4 rounded-lg border cursor-pointer transition ${
              n.isRead
                ? "bg-gray-100 border-gray-300"
                : "bg-purple-100 border-purple-400 hover:bg-purple-200"
            }`}
          >
            <div className="font-semibold">{n.title}</div>
            <div className="text-sm text-gray-600 mt-1">{n.message}</div>
            <div className="text-xs text-gray-400 mt-1">
              {new Date(n.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-4 py-2 rounded-md border ${
              p === page ? "bg-purple-600 text-white" : "bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
