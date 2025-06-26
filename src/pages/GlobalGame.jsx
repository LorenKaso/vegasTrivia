import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import useQuestionManager from "../components/useQuestionManager";
import GameLayout from "../components/GameLayout";
import Timer from "../components/Timer";
import "../components/GameLayout.css";
import "./GlobalGame.css";
import Scoreboard from "../components/Scoreboard";

function GlobalGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getNextQuestion, updateDifficulty } = useQuestionManager();

  const [score, setScore] = useState(0);
  const [doublePoints, setDoublePoints] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showNext, setShowNext] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);

  const playerName = localStorage.getItem("playerName") || "אנונימי";
  const avatar = localStorage.getItem("avatar") || "";

  const players = [
    { id: 1, name: playerName, score: score, avatar: avatar }
  ];

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

  const calculateScore = () => {
    let points = timeLeft > 15 ? 15 : 10;
    if (doublePoints) points *= 2;
    setScore(prev => prev + points);
    setDoublePoints(false);
  };

  const handleAnswerClick = (answer) => {
    if (selected || timeExpired) return;

    setSelected(answer);
    const isCorrect = answer === currentQuestion.correctAnswer;
    updateDifficulty(isCorrect);

    if (isCorrect) calculateScore();

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
        onDoublePoints={() => setDoublePoints(true)}
        players={players}
        showScoreboard={true}
      />
    </div>
  );
}

export default GlobalGame;
