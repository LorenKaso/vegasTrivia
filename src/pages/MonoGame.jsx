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
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showNext, setShowNext] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const [usedDoublePointsGlobal, setUsedDoublePointsGlobal] = useState(false);
  const [doublePointsActivated, setDoublePointsActivated] = useState(false);
  const [usedFiftyFiftyGlobal, setUsedFiftyFiftyGlobal] = useState(false);
  const [usedFriendHelpGlobal, setUsedFriendHelpGlobal] = useState(false);
  const [disabledAnswers, setDisabledAnswers] = useState([]);
  const [helpSuggestion, setHelpSuggestion] = useState(null);
 
  const playerName = localStorage.getItem("playerName") || "אנונימי";
  const avatar = localStorage.getItem("avatar") || "";

  const players = [
    { id: 1, name: playerName, score: score, avatar: avatar }
  ];

  const handleDoublePoints = () => {
    if (usedDoublePointsGlobal || selected || timeExpired) return;
    setUsedDoublePointsGlobal(true);
    setDoublePointsActivated(true);
  };

  const handleFiftyFifty = () => {
    if (usedFiftyFiftyGlobal || selected || timeExpired) return;

    const incorrect = currentQuestion.answers.filter(ans => ans !== currentQuestion.correctAnswer);
    const shuffled = incorrect.sort(() => 0.5 - Math.random());
    const toDisable = shuffled.slice(0, 2);

    setDisabledAnswers(toDisable);
    setUsedFiftyFiftyGlobal(true);
  };

  const handleFriendHelp = () => {
    if (usedFriendHelpGlobal || selected || timeExpired) return;

    const random = Math.random();
    let suggestion;

    if (random <= 0.85) {
      suggestion = currentQuestion.correctAnswer;
    } else {
      const wrong = currentQuestion.answers.filter(a => a !== currentQuestion.correctAnswer);
      suggestion = wrong[Math.floor(Math.random() * wrong.length)];
    }

    setHelpSuggestion(suggestion);
    setUsedFriendHelpGlobal(true);
  };

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

  const calculateScore = (isCorrect, timeTaken, difficulty, doublePointsActivated) => {
    if (!isCorrect) return 0;

    let points = 10;

    if (timeTaken <= 5 || (timeTaken <= 7 && difficulty > 5)) {
      points = 15;
    }

    if (doublePointsActivated) {
      points *= 2;
    }

    return points;
  };

  const handleAnswer = (isCorrect, timeTaken, difficulty) => {
    const points = calculateScore(isCorrect, timeTaken, difficulty, doublePointsActivated);
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

    if (!nextQ) {
      console.log("אין עוד שאלות — מעבר לדף highscore");
      localStorage.setItem("lastMonoScore", score);
      setIsFinishing(true);
      setTimeout(() => {
        navigate("/highscore");
      }, 1500);
      return;
    }

    setCurrentQuestion(nextQ);
    setSelected(null);
    setTimeLeft(30);
    setShowNext(false);
    setTimeExpired(false);
    setDoublePointsActivated(false);
    setHelpSuggestion(null);
    setDisabledAnswers([]);
  }, [showNext]);


  if (!currentQuestion && !isFinishing) {
    return <h2>טוען שאלות...</h2>;
  }

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
        onFiftyFifty={handleFiftyFifty} 
        onHelp={handleFriendHelp}
        helpSuggestion={helpSuggestion}
        disabledAnswers={disabledAnswers}
        usedDoublePointsGlobal={usedDoublePointsGlobal}
        doublePointsActivated={doublePointsActivated}
        usedFiftyFiftyGlobal={usedFiftyFiftyGlobal}
        usedFriendHelpGlobal={usedFriendHelpGlobal}
        players={players}
        showScoreboard={true}
      />
    </div>
  );
}

export default MonoGame;
