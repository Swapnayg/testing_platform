"use client"
import React, { useState } from 'react';
import QuizStartPage from '@/components/QuizStartPage';
import QuizInterface from '@/components/QuizInterface';

const Index = () => {
  const [currentView, setCurrentView] = useState<'start' | 'quiz'>('start');
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  const handleStartQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setCurrentView('quiz');
  };

  const handleBackToStart = () => {
    setCurrentView('start');
    setSelectedQuizId(null);
  };

  if (currentView === 'quiz' && selectedQuizId) {
    return <QuizInterface quizId={selectedQuizId} onBackToStart={handleBackToStart} />;
  }

  return <QuizStartPage onStartQuiz={handleStartQuiz} />;
};

export default Index;
