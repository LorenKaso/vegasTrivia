import { useState, useEffect } from "react";
import questionsData from "../data/questions.json";

export default function useQuestions(numQuestions = 10) {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // ערבוב השאלות ובחירת הכמות הרצויה
    const shuffled = [...questionsData].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numQuestions);
    setQuestions(selected);
  }, [numQuestions]);

  return questions;
}
