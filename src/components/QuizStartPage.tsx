
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
    data.forEach(async (d: any) => {
      var text = '';
      var id = '';
      if (new Date(d.exam.startTime) > new Date()) {
        text = "Upcoming";
        id = d.exam.id;
      }
      else{
        const res = await fetch(`/api/quizz?type=byId&rollNo=${encodeURIComponent(username.toUpperCase())}&id=${d.exam.quizzes[0].id}`);
        const answers = await res.json();
        text = answers.length === 0 ? 'Start Quiz' : (answers.length === 1 && answers[0]?.answers?.length === 0) ? 'Start Again' : 'Completed';
        id = d.exam.quizzes[0].id;
      }
      const newButton = { id: id, text: text };
      setButtonTexts((prev) => [...prev, newButton]);
    });
    console.log(data);
    setQuizzes(data);
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
            console.log(quiz);
            var btnText = '';
            if (new Date(quiz.exam.startTime) > new Date()) {
              btnText = 'Upcoming';
            }
            else{
              btnText = getTextById(quiz.exam.quizzes[0].id) || 'Loading...';
            }
             
            const isCompleted = btnText === 'Completed';
            return (
              <Card key={quiz.id} className="group hover:shadow-lg transition-all duration-200 border-slate-200 bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getSubjectIcon(quiz.exam.subject.name)}</span>
                      <Badge variant="outline" className="text-xs font-medium text-slate-600 border-slate-300">
                        {quiz.exam.subject.name}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                    {quiz.exam.title.toUpperCase()}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  
                  <div className="grid grid-cols-2 gap-4 py-3 border-t border-slate-100">
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-700 font-medium">{60} min</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <BookOpen className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-700 font-medium">{quiz.exam.totalMCQ} questions</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Award className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-700 font-medium">{quiz.exam.totalMarks} marks</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleStartQuizInPopup(quiz.exam.quizzes[0].id,username,quiz.exam.totalMarks)}
                    disabled={isCompleted}
                    className={`w-full ${ isCompleted ? 'bg-gray-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'} text-white font-medium py-2.5 group transition-all duration-200`}
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
