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
    <div className="flex flex-wrap items-center justify-between px-4 py-3 shadow bg-white gap-4 sm:gap-6">
      {/* SEARCH BAR - hidden on small screens */}
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
        <Image src="/search.png" alt="" width={14} height={14} />
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] p-2 bg-transparent outline-none text-sm"
        />
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3 sm:gap-5 ml-auto min-w-0">
        {/* Notification Bell with shifted popup */}
        <div className="relative w-8 h-8 flex items-center justify-center rounded-full bg-white cursor-pointer">
          <NotificationBell username={username} role={role} userId={userId} />
        </div>

        {/* User Info */}
        <div className="hidden xs:flex flex-col text-right truncate max-w-[100px]">
          <span className="text-xs font-medium leading-3 truncate">
            {capitalizedUsername.toUpperCase()}
          </span>
          <span className="text-[10px] text-gray-500 truncate">
            {role}
          </span>
        </div>

        {/* Clerk User Button */}
        <div className="shrink-0">
          <UserButton />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
