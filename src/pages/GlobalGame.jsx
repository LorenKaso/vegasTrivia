import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import useQuestionManager from "../components/useQuestionManager";
import GameLayout from "../components/GameLayout";
import Timer from "../components/Timer";
import "../components/GameLayout.css";
import FinalScoreboard from "../components/FinalScoreboard";

function GlobalGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getNextQuestion, updateDifficulty } = useQuestionManager();

  const [doublePoints, setDoublePoints] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showNext, setShowNext] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const [players, setPlayers] = useState([]);
  const [usedDoublePointsGlobal, setUsedDoublePointsGlobal] = useState(false);
  const [usedFiftyFiftyGlobal, setUsedFiftyFiftyGlobal] = useState(false);
  const [usedFriendHelpGlobal, setUsedFriendHelpGlobal] = useState(false);
  const [helpSuggestion, setHelpSuggestion] = useState(null);
  const [disabledAnswers, setDisabledAnswers] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [questionCounter, setQuestionCounter] = useState(1);

  const playerName = localStorage.getItem("playerName") || "אנונימי";
  const avatar = localStorage.getItem("avatar") || "";

  const handleDoublePoints = () => {
    if (usedDoublePointsGlobal || selected || timeExpired) return;
    setUsedDoublePointsGlobal(true);
    setDoublePoints(true);
  };

  const handleFiftyFifty = () => {
    if (usedFiftyFiftyGlobal || selected || timeExpired) return;
    setUsedFiftyFiftyGlobal(true);

    if (currentQuestion) {
      const incorrectAnswers = currentQuestion.answers.filter(
        (a) => a !== currentQuestion.correctAnswer
      );
      const answersToDisable = incorrectAnswers.slice(0, 2);
      setDisabledAnswers(answersToDisable);
    }
  };

  const handleFriendHelp = () => {
    if (usedFriendHelpGlobal || selected || timeExpired) return;
    setUsedFriendHelpGlobal(true);

    const random = Math.random();
    let suggestion;

    if (random <= 0.85) {
      suggestion = currentQuestion.correctAnswer;
    } else {
      const wrongAnswers = currentQuestion.answers.filter(
        (a) => a !== currentQuestion.correctAnswer
      );
      suggestion = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
    }

    setHelpSuggestion(suggestion);
  };

  useEffect(() => {
    const q = getNextQuestion();
    setCurrentQuestion(q);

    const initialPlayers = [
      { id: 1, name: playerName, score: 0, avatar, answer: null, isBot: false },
      { id: 2, name: "רוברט", score: 0, avatar: "", answer: null, isBot: true },
      { id: 3, name: "ריטבוט", score: 0, avatar: "", answer: null, isBot: true },
      { id: 4, name: "בטי", score: 0, avatar: "", answer: null, isBot: true },
      { id: 5, name: "ברטה", score: 0, avatar: "", answer: null, isBot: true },
    ];

    setPlayers(initialPlayers);
  }, []);

  useEffect(() => {
    if (!currentQuestion) return;

    players.forEach((player) => {
      if (player.isBot) {
        const answerTime = Math.random() * 6000 + 2000;
        setTimeout(() => {
          handleBotAnswer(player.id);
        }, answerTime);
      }
    });
  }, [currentQuestion]);

  useEffect(() => {
    if (!currentQuestion || showNext || timeExpired) return;

    if (timeLeft === 0) {
      revealAnswer();
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, currentQuestion, showNext, timeExpired]);

  const revealAnswer = () => {
    setTimeExpired(true);
    setTimeout(() => {
      setShowNext(true);
    }, 3000);
  };

  const calculateScore = (isCorrect, isFirstCorrect, difficulty, doublePoints) => {
    if (!isCorrect) return 0;

    let points = isFirstCorrect ? 15 : 10;
    if (isFirstCorrect && difficulty > 6) points += 5;
    if (doublePoints) points *= 2;

    return points;
  };

  const handlePlayerAnswer = (playerId, answer) => {
    setPlayers((prev) => {
      const updatedPlayers = prev.map((p) =>
        p.id === playerId ? { ...p, answer } : p
      );

      const correctPlayers = updatedPlayers.filter(
        (p) => p.answer === currentQuestion.correctAnswer
      );
      const isFirstCorrect =
        correctPlayers.length === 1 && answer === currentQuestion.correctAnswer;
      const isCorrect = answer === currentQuestion.correctAnswer;
      const difficulty = currentQuestion.difficulty;
      const points = calculateScore(
        isCorrect,
        isFirstCorrect,
        difficulty,
        doublePoints
      );

      const newPlayers = updatedPlayers.map((p) =>
        p.id === playerId ? { ...p, score: p.score + points } : p
      );

      const allAnswered = newPlayers.every((p) => p.answer !== null);

      if (allAnswered && !timeExpired) {
        revealAnswer();
      }

      return newPlayers;
    });

    if (playerId === 1) {
      setSelected(answer);
      const isCorrect = answer === currentQuestion.correctAnswer;
      updateDifficulty(isCorrect);
    }
  };

  const handleAnswerClick = (answer) => {
    if (selected || timeExpired) return;
    handlePlayerAnswer(1, answer);
  };

  const handleBotAnswer = (botId) => {
    if (timeExpired) return;

    const randomValue = Math.random();
    const botAnswer =
      randomValue < 0.7
        ? currentQuestion.correctAnswer
        : currentQuestion.answers.filter(
            (a) => a !== currentQuestion.correctAnswer
          )[Math.floor(Math.random() * (currentQuestion.answers.length - 1))];

    handlePlayerAnswer(botId, botAnswer);
  };

  useEffect(() => {
    if (!showNext) return;

    const nextQ = getNextQuestion();

    if (!nextQ) {
      console.log("הסתיימו כל 10 השאלות — מציג לוח סיכום");
      console.log("מספר השאלה היה:", questionCounter);
      setCurrentQuestion(null);
      setGameOver(true);
      return;
    }

    setQuestionCounter((prev) => prev + 1);
    console.log("שאלה מס׳:", questionCounter + 1);

    setCurrentQuestion(nextQ);
    setSelected(null);
    setTimeLeft(30);
    setShowNext(false);
    setTimeExpired(false);
    setHelpSuggestion(null);
    setDisabledAnswers([]);
    setDoublePoints(false);
    setPlayers((prev) =>
      prev.map((p) => ({ ...p, answer: null }))
    );
  }, [showNext]);

  if (gameOver) {
    return (
      <FinalScoreboard
        players={players}
        title="טבלת סיכום - עולמי"
      />
    );
  }

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
        players={players}
        showScoreboard={true}
        onDoublePoints={handleDoublePoints}
        onFiftyFifty={handleFiftyFifty}
        onHelp={handleFriendHelp}
        usedDoublePointsGlobal={usedDoublePointsGlobal}
        usedFiftyFiftyGlobal={usedFiftyFiftyGlobal}
        usedFriendHelpGlobal={usedFriendHelpGlobal}
        helpSuggestion={helpSuggestion}
        disabledAnswers={disabledAnswers}
        doublePointsActivated={doublePoints}
      />
    </div>
  );
}

export default GlobalGame;
