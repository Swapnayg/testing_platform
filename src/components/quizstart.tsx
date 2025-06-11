"use client"
import React, { useState } from 'react';
import QuizStartPage from '@/components/QuizStartPage';


const QuizStart = ({ username }: { username: string;  }) => {

  return <QuizStartPage username ={username} />;
};

export default QuizStart;