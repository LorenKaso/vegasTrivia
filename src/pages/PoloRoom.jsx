import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useSocket from "../hooks/useSocket";
import GameLayout from "../components/GameLayout";
import "../components/GameLayout.css";
import "./PoloRoom.css";

function PoloRoom() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId") || "";
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [reveal, setReveal] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [scores, setScores] = useState({});
  const [fastest, setFastest] = useState(null);
  const [localTimer, setLocalTimer] = useState(30); // ⏱️ טיימר פנימי

  const playerName = localStorage.getItem("playerName") || "אנונימי";
  const avatar = localStorage.getItem("avatar") || "";
  const isOwner = localStorage.getItem("isOwner") === "true";
  const hasAnswered = useRef(false);

  const handleSocketMessage = (data) => {
    if (data.type === "player_list") {
      setPlayers(data.players);
    }

    if (data.type === "question") {
      setQuestion(data.question);
      setAnswers(data.answers);
      setReveal(false);
      setSelectedAnswer(null);
      setFastest(null);
      hasAnswered.current = false;
      setLocalTimer(30); // איפוס הטיימר
    }

    if (data.type === "reveal") {
      setCorrectAnswer(data.correctAnswer);
      setReveal(true);
      setFastest(data.fastest || null);

      const scoreMap = {};
      data.players.forEach((p) => {
        scoreMap[p.name] = p.score;
      });
      setScores(scoreMap);
    }

    if (data.type === "game_over") {
      setGameOver(true);
    }
  };

  const { sendMessage, isReady } = useSocket(handleSocketMessage, roomId);

  useEffect(() => {
    if (!isReady) return;

    sendMessage({
      type: "join",
      roomId,
      name: playerName,
      avatar,
    });
  }, [isReady]);

  const handleStart = () => {
    if (isOwner && isReady) {
      sendMessage({ type: "start_game" });
    }
  };

  const handleAnswer = (answer) => {
    if (!isReady || hasAnswered.current || reveal) return;
    hasAnswered.current = true;
    setSelectedAnswer(answer);
    sendMessage({
      type: "answer",
      name: playerName,
      answer,
    });
  };

  // ⏳ טיימר רץ כל עוד לא בשלב reveal
  useEffect(() => {
    if (!question || reveal) return;
    setLocalTimer(30);
    const interval = setInterval(() => {
      setLocalTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [question, reveal]);

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <>
      {/* טיימר מוצג בפינה השמאלית העליונה */}
      {question && !reveal && (
      <div className="monopoly-timer">
        ⏱️ {formatTime(localTimer)}
      </div>

      )}

      <GameLayout
        question={question}
        answers={answers}
        selected={selectedAnswer}
        correctAnswer={correctAnswer}
        onAnswerClick={handleAnswer}
        onDoublePoints={() => {}}
        players={players.map((p) => ({
          ...p,
          score: scores[p.name] || 0,
        }))}
      >
        {isOwner && !question && (
          <button className="start-game-btn" onClick={handleStart}>
            🚀 התחל משחק
          </button>
        )}

        {reveal && <p>✔️ התשובה הנכונה: {correctAnswer}</p>}
        {gameOver && <h3>🎉 המשחק הסתיים!</h3>}
      </GameLayout>
    </>
  );
}

export default PoloRoom;
