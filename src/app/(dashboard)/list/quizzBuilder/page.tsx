import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Registration, Prisma} from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import QuizBuilder from "@/components/QuizBuilder";


const QuizzListPage = async () => {

const { userId, sessionClaims } = auth();
const role = (sessionClaims?.metadata as { role?: string })?.role;
const currentUserId = userId;

  // ROLE CONDITIONS

  switch (role) {
    case "admin":
      break;
    default:
      break;
  }




  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
         <QuizBuilder />;
    </div>
  );
};

export default QuizzListPage;
