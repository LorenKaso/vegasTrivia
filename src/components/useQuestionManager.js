import { useState } from "react";
import questionsData from "../data/questions.json"; // הנתיב בהתאם למיקום האמיתי

function useQuestionManager() {
  const groupedQuestions = {};

  // חילוק השאלות לרמות קושי עם ערבוב פנימי בכל רמה
  for (let i = 1; i <= 10; i++) {
    groupedQuestions[i] = questionsData
      .filter((q) => q.difficulty === i)
      .sort(() => 0.5 - Math.random());
  }

  // לוקחים מכל רמת קושי עד 2 שאלות (אם יש מספיק)
  const pooledQuestions = [];
  for (let i = 1; i <= 10; i++) {
    pooledQuestions.push(...groupedQuestions[i].slice(0, 2));
  }

  // ערבוב סופי של הבריכה שנוצרה
  const shuffledPool = pooledQuestions.sort(() => 0.5 - Math.random());

  // חלוקה מחודשת של ה־20 שאלות לפי רמות קושי
  const finalGrouped = {};
  for (let i = 1; i <= 10; i++) {
    finalGrouped[i] = shuffledPool.filter((q) => q.difficulty === i);
  }

  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [difficulty, setDifficulty] = useState(1);

  const getNextQuestion = () => {
    if (selectedQuestions.length >= 10) return null;

    const unusedCurrent = finalGrouped[difficulty].filter(
      (q) => !selectedQuestions.includes(q)
    );

    let pool = unusedCurrent;

    if (pool.length === 0) {
      for (let offset = 1; offset <= 10; offset++) {
        if (difficulty - offset >= 1) {
          const lower = finalGrouped[difficulty - offset].filter(
            (q) => !selectedQuestions.includes(q)
          );
          if (lower.length) {
            pool = lower;
            break;
          }
        }
        if (difficulty + offset <= 10) {
          const higher = finalGrouped[difficulty + offset].filter(
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
