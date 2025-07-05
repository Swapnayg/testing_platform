import StudentAnnouncementPage from '@/components/studentAnnoucements';
import { auth, getAuth, clerkClient } from "@clerk/nextjs/server";

const StudentAnnListPage = async () => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const client = clerkClient();
  
  let user = null;
  var username = "";
  if (userId) {
    user = await client.users.getUser(userId);
    username = user.username?.toString() ?? "";
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <StudentAnnouncementPage username={username}></StudentAnnouncementPage>
    </div>
  );
};

export default StudentAnnListPage;
