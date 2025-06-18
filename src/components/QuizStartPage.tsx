
import { useEffect, useState } from 'react'
import { Clock, BookOpen, Award, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from "next/link";

interface QuizStartPageProps {
  username:string,
}

const QuizStartPage: React.FC<QuizStartPageProps> =  ({ username}) => {

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [buttonTexts, setButtonTexts] = useState<{ id: any; text: string }[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizId, setQuizId] = useState("");
  const [totalMarks, settotalMarks] = useState(0);
  const [isCompleted, setisCompleted] = useState(false);

  const getStudentByRollNo = async (rollNo: string) => {
  try {
    const response = await fetch(`/api/quizz?type=byRoll&rollNo=${encodeURIComponent(rollNo)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const results = await response.json();
    return results;
  } catch (error) {
    return null;
  }
};
useEffect(() => {
  const fetchStudentQuizzes = async () => {
    const data = await getStudentByRollNo(username.toUpperCase());
    console.log(data);
    setQuizzes(data.quizzes);
  };

  if (username) {
    fetchStudentQuizzes();

  }
}, [username]);


const handleStartQuizInPopup = (quizId: string, username:string, totalMarks:number) => {
    // Create popup window with restricted features
    const popup = window.open(
      `${window.location.origin}//list/myquiz/${quizId}?id=${quizId}&username=${username}&totalMarks=${totalMarks}`,
      'QuizWindow',
      'width=1200,height=800,scrollbars=yes,resizable=yes,status=no,location=no,toolbar=no,menubar=no,directories=no'
    );
    
    if (popup) {
      // Focus the popup window
      popup.focus();
      
      // Disable right-click context menu in the popup
      popup.addEventListener('load', () => {
        popup.document.addEventListener('contextmenu', (e) => e.preventDefault());
      });
    } else {
      // Fallback if popup is blocked
      alert('Please allow popups for this site to start the quiz');
    }
  };



const getTextById = (id: any) => {
  console.log(id);
  console.log(buttonTexts);
  const item = buttonTexts.find((entry) => entry.id === id);
  return item?.text ?? "Default Text";
};

  function getSubjectIcon(subject: string) {
    switch (subject) {
      case 'Mathematics': return '📐';
      case 'Science': return '🔬';
      case 'English': return '✍️';
      case 'History': return '🕰️';
      case 'Geography': return '🌍';
      case 'Physics': return '🌌';
      case 'Chemistry': return '🧪';
      case 'Biology': return '🌿';
      case 'Computer Science': return '💻';
      case 'Art': return '🎨';
      default: return '📚';
    }
  }

  return (
    <div>
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Quiz Portal</h1>
            <p className="text-slate-600">Choose a quiz to test your knowledge</p>
          </div>
        </div>
      </div>

      {/* Quiz Grid */}
<div className="container mx-auto px-6 py-8">
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {quizzes.map((quiz) => {
      const isCompleted = quiz.quizType === "completed";
      const isUpcoming = quiz.quizType === "upcoming";

      const btnText = isCompleted
        ? "Completed"
        : isUpcoming
        ? "Upcoming"
        : "Start Now";

      return (
        <Card
          key={quiz.id}
          className="group hover:shadow-lg transition-all duration-200 border-slate-200 bg-white"
        >
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getSubjectIcon(quiz.subject)}</span>
                <Badge
                  variant="outline"
                  className="text-xs font-medium text-slate-600 border-slate-300"
                >
                  {quiz.subject}
                </Badge>
              </div>
            </div>
            <CardTitle className="text-xl font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
              {quiz.title.toUpperCase()}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 py-3 border-t border-slate-100">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-slate-700 font-medium">{quiz.duration}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span className="text-slate-700 font-medium">{quiz.questions} questions</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Award className="w-4 h-4 text-slate-500" />
                <span className="text-slate-700 font-medium">{quiz.totalMarks} marks</span>
              </div>
            </div>

            <Button
              onClick={() => handleStartQuizInPopup(quiz.id, username, quiz.totalMarks)}
              disabled={isCompleted}
              className={`w-full ${
                isCompleted
                  ? "bg-gray-400 cursor-not-allowed"
                  : isUpcoming
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-slate-900 hover:bg-slate-800"
              } text-white font-medium py-2.5 group transition-all duration-200`}
            >
              {btnText}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      );
    })}
  </div>
</div>
    </div>
    </div>
  );

};

export default QuizStartPage;
