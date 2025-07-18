import { useState } from "react";
import questionsData from "../data/questions.json"; // הנתיב בהתאם למיקום האמיתי

function useQuestionManager() {
  const shuffledAll = [...questionsData].sort(() => 0.5 - Math.random());

  const picked = [];
  const used = new Set();

  for (let difficulty = 1; difficulty <= 10; difficulty++) {
    const question = shuffledAll.find(
      (q) => q.difficulty === difficulty && !used.has(q.question)
    );
    if (question) {
      picked.push(question);
      used.add(question.question);
    }
  }

  const remaining = shuffledAll.filter((q) => !used.has(q.question));
  const needed = 10 - picked.length;
  picked.push(...remaining.slice(0, needed));

  const finalQuestions = picked.sort(() => 0.5 - Math.random());

  const [currentIndex, setCurrentIndex] = useState(0);

  const getNextQuestion = () => {
    if (currentIndex >= finalQuestions.length) return null;
    const next = finalQuestions[currentIndex];
    setCurrentIndex((prev) => prev + 1);
    return next;
  };

  const updateDifficulty = () => {
  };

  return { getNextQuestion, updateDifficulty };
}

export default useQuestionManager;
