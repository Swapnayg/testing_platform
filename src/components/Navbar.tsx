// components/Navbar.tsx
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { NotificationBell } from "@/components/notification";
import { UserRole } from "@prisma/client";

const Navbar = async () => {
  const user = await currentUser();

  const username =
    (user?.username as string) ||
    (user?.publicMetadata?.cnicNumber as string) ||
    "";

  const role = user?.publicMetadata?.role as string;

  const capitalizedUsername =
    role === "student" ? username.toUpperCase() : username.toLowerCase();

  // Get userId from internal user table
  const dbUser = await prisma.user.findFirst({
    where: {
      name: capitalizedUsername,
      role: role as UserRole, // ensure enum cast
    },
    select: { id: true },
  });

  const userId = dbUser?.id ?? 0; // Provide a default value if undefined

  return (
    <div className="flex items-center justify-between p-4 shadow bg-white">
      {/* SEARCH BAR */}
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
        <Image src="/search.png" alt="" width={14} height={14} />
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] p-2 bg-transparent outline-none"
        />
      </div>

      {/* ICONS AND USER */}
      <div className="flex items-center gap-6 justify-end w-full">

        {/* Notification Bell */}
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <NotificationBell
            username={username}
            role={role}
            userId={userId}
          />
        </div>

        {/* User Info */}
        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">
            {capitalizedUsername.toUpperCase()}
          </span>
          <span className="text-[10px] text-gray-500 text-right">
            {role}
          </span>
        </div>

        {/* Clerk User Button */}
        <UserButton />
      </div>
    </div>
    
  );
};

export default Navbar;
