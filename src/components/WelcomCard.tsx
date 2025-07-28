
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowUp, ArrowDown, BookOpen, CalendarCheck, Clock, Star } from "lucide-react";
import React from "react";
import { getStudentQuizStats } from "@/lib/actions";

interface WelcomeCardProps {
  username: string;
  studentId:string;
}
const WelcomeCard: React.FC<WelcomeCardProps> = async ({ username, studentId }) => {
  const currentDate = new Date();
  const stats = await getStudentQuizStats(studentId);

  type StatCard = {
  title: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative";
  description: string;
  icon: React.ElementType;
};
  const statsCards: StatCard[] = [
  {
    title: "Quiz Completed",
    value: stats.quizCompleted,
    change: "+1",
    changeType: "positive",
    description: "since last month",
    icon: BookOpen,
  },
  {
    title: "Upcoming Quiz",
    value: stats.upcomingQuizzes.length ?? 0,
    change: "-1",
    changeType: "negative",
    description: "this week",
    icon: CalendarCheck,
  },
  {
    title: "Average Quiz Score",
    value: stats.averageScore,
    change: "+5",
    changeType: "positive",
    description: "this month",
    icon: Clock,
  },
  {
    title: "Best Performing Subject",
    value: stats.bestSubject,
    change: "+2",
    changeType: "positive",
    description: "earned",
    icon: Star,
  },
];

  return (
 <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 border-0 shadow-xl">
  <CardContent className="p-6 sm:p-8">
    {/* Top Section - Welcome Message */}
    <div className="flex flex-col lg:flex-row items-center gap-6 mb-8">
      <Avatar className="w-20 h-20 border-4 border-white/20 shadow-lg">
        <AvatarImage src="/placeholder.svg?height=80&width=80" />
        <AvatarFallback className="bg-white text-emerald-700 text-2xl font-bold">
          {username?.split('').map(n => n[0].toUpperCase()).join('')}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 text-center lg:text-left min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Welcome back, {username.toUpperCase()}!
        </h1>
        <p className="text-emerald-100 mb-3 text-base sm:text-lg">
          Ready to excel in your studies today?
        </p>
        <p className="text-emerald-200 text-sm font-medium">
          {currentDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="bg-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-sm text-center lg:text-right w-full sm:w-auto">
        <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
          {stats.overallScore}%
        </div>
        <div className="text-emerald-100 text-sm font-medium">Overall Score</div>
      </div>
    </div>

    {/* Bottom Section - Stat Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-emerald-100 text-sm font-medium truncate">
                {stat.title}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1 truncate">
                {stat.value}
              </p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg ml-3 shrink-0">
              <stat.icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </CardContent>
</Card>

  );
};

export default WelcomeCard;
