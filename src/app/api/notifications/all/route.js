import prisma from "@/lib/prisma";
import { UserRole } from '@prisma/client';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const role = searchParams.get("role");
  const status = searchParams.get("status"); // 'all', 'unread', 'read'
  const page = parseInt(searchParams.get("page") || "1");
  const take = 10;
  const skip = (page - 1) * take;

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

    if (!user) {
        return new Response("User not found", { status: 404 });
    }

    // Build where condition for notifications
    const where = {
        receiverId: user.id,
        ...(status === "unread" && { isRead: false }),
        ...(status === "read" && { isRead: true }),
    };

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take,
        skip,
    });

    
    const total = await prisma.notification.count({ where });

    // ✅ Count of all unread (regardless of current status filter)
    const unreadCount = await prisma.notification.count({
        where: {
        receiverId: user.id,
        isRead: false,
        },
    });

    return Response.json({
        notifications,
        total,
        page,
        unreadCount, // ✅ Return it to frontend
    });
}
