
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import FloatingChat from "@/components/FloatingChat";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();

  const username =
    (user?.username as string) ||
    (user?.publicMetadata?.cnicNumber as string) ||
    "";

  const role = user?.publicMetadata?.role as UserRole | undefined;


  async function getUserIdByNameAndRole() {
    const user = await prisma.user.findFirst({
      where: {
          name:username,
          role: role,
      },
        select: {
          id: true,
        },
      });
    
    return user?.id ?? null;
  }

  const userId = await getUserIdByNameAndRole();

  return (
    <div className="h-screen flex">
      {/* LEFT */}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4">
        <Link
          href="/"
          className="flex items-center justify-center lg:justify-start gap-2"
        >
          <Image src="/logo.png" alt="logo" width={32} height={32} />
          <span className="hidden lg:block font-bold">SchooLama</span>
        </Link>
        <Menu />
      </div>
      {/* RIGHT */}
      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll flex flex-col">
        <Navbar />
        {userId !== null && (
          <FloatingChat username={username} role={role ?? ""} userId={userId} />
        )}
        {children}
      </div>
    </div>
  );
}
