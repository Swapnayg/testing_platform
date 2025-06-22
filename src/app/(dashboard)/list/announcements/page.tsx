import AdminAnnouncementPage from '@/components/adminAnnoucements';
import { auth } from "@clerk/nextjs/server";

const AnnouncementListPage = async () => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <AdminAnnouncementPage></AdminAnnouncementPage>
    </div>
  );
};

export default AnnouncementListPage;
