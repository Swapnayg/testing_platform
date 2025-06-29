// /api/notifications/mark-all-read/route.ts
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function PATCH(req) {
  const { username, role } = await req.json();

  // Sanitize and validate role
  const sanitizedRole = role?.toLowerCase();
  const allowedRoles = Object.values(UserRole);

  if (!allowedRoles.includes(sanitizedRole)) {
    return new Response("Invalid role", { status: 400 });
  }

  // Sanitize username based on role
  const capitalizedUsername =
    sanitizedRole === "student" && typeof username === "string"
      ? username.toUpperCase()
      : username?.toLowerCase();

  // Find user
  const user = await prisma.user.findFirst({
    where: {
      name: capitalizedUsername,
      role: sanitizedRole,
    },
  });

  if (!user) return new Response("User not found", { status: 404 });

  await prisma.notification.updateMany({
    where: { receiverId: user.id, isRead: false },
    data: { isRead: true },
  });

  return new Response("All marked as read", { status: 200 });
}
