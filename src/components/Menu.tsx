import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";


const Menu = async () => {
  const user = await currentUser();
  const role = user?.publicMetadata.role;
  const username = user?.username || user?.publicMetadata.cnicNumber;

  const menuItems = [
    {
      title: "MENU",
      items: [
        {
          icon: "/home.png",
          label: "Home",
          href: "/",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/student.png",
          label: "Students",
          href: "/list/students",
          visible: ["admin", "teacher"],
        },
        {
          icon: "/exam.png",
          label: "Exams",
          href: "/list/exams",
          visible: ["admin", "teacher", "parent"],
        },
        {
          icon: "/brain.png",
          label: "Quiz builder",
          href: "/list/quizzBuilder",
          visible: ["admin"],
        },
        {
          icon: "/myquiz.png",
          label: "My Quiz",
          href: "/list/myquiz",
          visible: ["student"],
        },
        {
          icon: "/result.png",
          label: "Results",
          href: "/list/results",
          visible: ["admin"],
        },
        {
          icon: "/result.png",
          label: "Results",
          href: "/list/studentResults",
          visible: ["student"],
        },
        // {
        //   icon: "/attendance.png",
        //   label: "Attendance",
        //   href: "/list/attendance",
        //   visible: ["admin", "teacher", "student", "parent"],
        // },
        // {
        //   icon: "/calendar.png",
        //   label: "Events",
        //   href: "/list/events",
        //   visible: ["admin", "teacher", "student", "parent"],
        // },
        // {
        //   icon: "/message.png",
        //   label: "Messages",
        //   href: "/list/messages",
        //   visible: ["admin", "teacher", "student", "parent"],
        // },
        {
          icon: "/announcement.png",
          label: "Announcements",
          href: "/list/announcements",
          visible: ["admin"],
        },
        {
          icon: "/announcement.png",
          label: "Announcements",
          href: "/list/studentAnnoucement",
          visible: ["student"],
        },
        {
          icon: "/profile.png",
          label: "Profile",
          href: `/student/${username}/profile`, // ✅ now works
          visible: ["student"],
        },
      ],
    },
  ];

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">{i.title}</span>
          {i.items.map((item) => {
            if (typeof role === "string" && item.visible.includes(role)) {
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;
