import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import useQuestionManager from "../components/useQuestionManager";
import GameLayout from "../components/GameLayout";
import Timer from "../components/Timer";
import "../components/GameLayout.css";
import "./MonoGame.css";
import Scoreboard from "../components/Scoreboard";

function MonoGame() {
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

  const handleDoublePoints = () => {
    if (!doublePoints) {
      setDoublePoints(true);
      setTimeout(() => setDoublePoints(false), 10000); // פעיל 10 שניות
    }
  };

  useEffect(() => {
    const q = getNextQuestion();
    setCurrentQuestion(q);
  }, []);

  useEffect(() => {
    console.log("מצב הכפלת ניקוד:", doublePoints);
  }, [doublePoints]);

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

  const calculateScore = (isCorrect, timeTaken, difficulty, doublePoints) => {
    if (!isCorrect) return 0;

    let points = 10;

    if (timeTaken <= 5) {
      points = 15;
    } else if (timeTaken <= 7 && difficulty > 5) {
      points = 15;
    }

    if (doublePoints) {
      points *= 2;
    }

    return points;
  };


  const handleAnswer = (isCorrect, timeTaken, difficulty) => {
    const points = calculateScore(isCorrect, timeTaken, difficulty, doublePoints);
    setScore(prev => prev + points);
  };


  const handleAnswerClick = (answer) => {
    if (selected || timeExpired) return;

    setSelected(answer);
    const isCorrect = answer === currentQuestion.correctAnswer;
    updateDifficulty(isCorrect);

    const timeTaken = 30 - timeLeft;
    const difficulty = currentQuestion.difficulty;

    handleAnswer(isCorrect, timeTaken, difficulty);

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
        onDoublePoints={handleDoublePoints}
        players={players}
        showScoreboard={true}
      />
    </div>
  );
}

export default MonoGame;
