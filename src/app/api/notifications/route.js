import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const role = searchParams.get("role");

  // Role validation
  const allowedRoles = Object.values(UserRole);
  const sanitizedRole = role?.toLowerCase();

  if (!allowedRoles.includes(sanitizedRole)) {
    return new Response("Invalid role", { status: 400 });
  }

  // Format username based on role
  const capitalizedUsername =
    sanitizedRole === "student" && typeof username === "string"
      ? username.toUpperCase()
      : username?.toLowerCase();

  // Look up user
  const user = await prisma.user.findFirst({
    where: { name: capitalizedUsername, role: sanitizedRole },
  });

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  // Fetch recent notifications (latest 5)
  const notifications = await prisma.notification.findMany({
    where: { receiverId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Count unread notifications
  const unreadCount = await prisma.notification.count({
    where: { receiverId: user.id, isRead: false },
  });

  return Response.json({ notifications, unreadCount });
}
