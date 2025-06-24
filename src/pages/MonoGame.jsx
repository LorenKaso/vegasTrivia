import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useQuestionManager from "../components/useQuestionManager";
import GameLayout from "../components/GameLayout";
import Timer from "../components/Timer";
import "../components/GameLayout.css";
import "./MonoGame.css";
import Scoreboard from "../components/Scoreboard";

function MonoGame() {
  const navigate = useNavigate();
  const { getNextQuestion, updateDifficulty } = useQuestionManager();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showNext, setShowNext] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);

  useEffect(() => {
    const q = getNextQuestion();
    setCurrentQuestion(q);
  }, []);

  useEffect(() => {
    if (!currentQuestion || selected || showNext || timeExpired) return;

    if (timeLeft === 0) {
      revealAnswer();
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, selected, showNext, timeExpired, currentQuestion]);

  const revealAnswer = () => {
    setTimeExpired(true);
    setTimeout(() => {
      setShowNext(true);
    }, 3000);
  };

  const handleAnswerClick = (answer) => {
    if (selected || timeExpired) return;

    setSelected(answer);
    const isCorrect = answer === currentQuestion.correctAnswer;
    updateDifficulty(isCorrect);

    setTimeout(() => {
      setShowNext(true);
    }, 3000);
  };

  useEffect(() => {
    if (!showNext) return;

    const nextQ = getNextQuestion();
    setCurrentQuestion(nextQ);
    setSelected(null);
    setTimeLeft(30);
    setShowNext(false);
    setTimeExpired(false);
  }, [showNext]);

  if (!currentQuestion) return <h2>טוען שאלות...</h2>;

  return (
    <div className="game-layout-body">
      <Timer timeLeft={timeLeft} />

      <GameLayout
        question={currentQuestion.question}
        answers={currentQuestion.answers}
        selected={selected}
        correctAnswer={currentQuestion.correctAnswer}
        onAnswerClick={handleAnswerClick}
      />
    </div>
  );
}

export default MonoGame;
