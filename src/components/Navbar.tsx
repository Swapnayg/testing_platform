import { UserButton, ClerkProvider } from "@clerk/nextjs";
import { NotificationBell } from '@/components/notification';
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import prisma from "@/lib/prisma";

const Navbar = async () => {
  const user = await currentUser();
  const username = (user?.username as string) || (user?.publicMetadata.cnicNumber as string) || "";
  const role = user?.publicMetadata?.role || "";

  async function getUserIdByNameAndRole() {
    const user = await prisma.user.findFirst({
      where: {
        name: username,
        role: role,
      },
      select: {
        id: true,
      },
    });
  
    return user?.id ?? null;
  }

  const userId = await getUserIdByNameAndRole();

  if (!userId) {
    return new Response("User not found", { status: 404 });
  }

  
  return (
    <div className="flex items-center justify-between p-4">
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
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
          <Image src="/message.png" alt="" width={20} height={20} />
        </div>
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <NotificationBell username={String(username || "")} role={String(role || "")} userId={userId} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">{username.toString().toUpperCase()}</span>
          <span className="text-[10px] text-gray-500 text-right">
            {user?.publicMetadata?.role as string}
          </span>
        </div>
        {/* <Image src="/avatar.png" alt="" width={36} height={36} className="rounded-full"/> */}
        {/* <ClerkProvider> */}
          <UserButton />
        {/* </ClerkProvider> */}
      </div>
    </div>
  );
};

export default Navbar;
