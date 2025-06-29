// POST /api/notifications/read
import prisma from "@/lib/prisma";

export async function POST(req) {
  const { notificationId } = await req.json();

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return Response.json({ success: true });
}
