import { useState } from "react";
import questionsData from "../data/questions.json"; // הנתיב בהתאם למיקום האמיתי

function useQuestionManager() {
  const groupedQuestions = {};
  for (let i = 1; i <= 10; i++) {
    groupedQuestions[i] = questionsData.filter((q) => q.difficulty === i);
  }

  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [difficulty, setDifficulty] = useState(1);

  const getNextQuestion = () => {
    if (selectedQuestions.length >= 10) return null;

    // ניסיון למצוא שאלה ברמת הקושי הנוכחית
    const unusedCurrent = groupedQuestions[difficulty].filter(
      (q) => !selectedQuestions.includes(q)
    );

    let pool = unusedCurrent;

    // אם אין שאלות, מחפשים בקשיים קרובים
    if (pool.length === 0) {
      for (let offset = 1; offset <= 10; offset++) {
        if (difficulty - offset >= 1) {
          const lower = groupedQuestions[difficulty - offset].filter(
            (q) => !selectedQuestions.includes(q)
          );
          if (lower.length) {
            pool = lower;
            break;
          }
        }
        if (difficulty + offset <= 10) {
          const higher = groupedQuestions[difficulty + offset].filter(
            (q) => !selectedQuestions.includes(q)
          );
          if (higher.length) {
            pool = higher;
            break;
          }
        }
      }
    }

    if (pool.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * pool.length);
    const nextQuestion = pool[randomIndex];

    setSelectedQuestions((prev) => [...prev, nextQuestion]);

    return nextQuestion;
  };

  const updateDifficulty = (isCorrect) => {
    setDifficulty((prev) => {
      if (isCorrect) return Math.min(prev + 1, 10);
      return Math.max(prev - 1, 1);
    });
  };

  return { getNextQuestion, updateDifficulty, selectedQuestions };
}

export default useQuestionManager;
