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
  const [questionObject, setQuestionObject] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [reveal, setReveal] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [scores, setScores] = useState({});
  const [fastest, setFastest] = useState(null);
  const [localTimer, setLocalTimer] = useState(30);
  const [usedDouble, setUsedDouble] = useState(false);
  const [questionId, setQuestionId] = useState(null);
  const [fiftyDisabled, setFiftyDisabled] = useState([]);
  const [friendSuggestion, setFriendSuggestion] = useState(null);
  const [doublePointsActivated, setDoublePointsActivated] = useState(false);
  const [usedDoubleGlobal, setUsedDoubleGlobal] = useState(false);
  const [showDoubleMessage, setShowDoubleMessage] = useState(false);
  const [usedFiftyFifty, setUsedFiftyFifty] = useState(false);
  const [usedFriendHelpGlobal, setUsedFriendHelpGlobal] = useState(false);

  const playerName = localStorage.getItem("playerName") || "אנונימי";
  const avatar = localStorage.getItem("avatar") || "";
  const isOwner = localStorage.getItem("isOwner") === "true";
  const hasAnswered = useRef(false);
  const timerRef = useRef(null);

  const handleSocketMessage = (data) => {
    if (data.type === "player_list") {
      const unique = [];
      const seen = new Set();
      data.players.forEach((p) => {
        if (!seen.has(p.name)) {
          unique.push(p);
          seen.add(p.name);
        }
      });
      setPlayers(unique);
    }

    if (data.type === "question") {
      setQuestion(data.question.question);
      setQuestionId(data.question.id);
      setAnswers(data.question.answers);
      setQuestionObject(data.question);
      setReveal(false);
      setSelectedAnswer(null);
      setFastest(null);
      hasAnswered.current = false;
      setUsedDouble(false);
      setFriendSuggestion(null);
      setFiftyDisabled([]);
      setDoublePointsActivated(false);
      setShowDoubleMessage(false);

      const now = Date.now() / 1000;
      const start = data.question.startTime;
      const secondsLeft = Math.max(0, Math.floor(start + 30 - now));
      setLocalTimer(secondsLeft);
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

    if (data.type === "friend_suggestion") {
      setFriendSuggestion(data.suggestion);
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

  const handleAnswer = (answer, double = false) => {
    if (!isReady || hasAnswered.current || reveal) return;
    hasAnswered.current = true;
    setSelectedAnswer(answer);
    sendMessage({
      type: "answer",
      name: playerName,
      answer,
      double,
    });
    setFriendSuggestion(null);
  };

  const handleFriendHelp = () => {
    if (!isReady || questionId === null || usedFriendHelpGlobal) return;
    sendMessage({ type: "friend_help", questionId });
    setUsedFriendHelpGlobal(true);
  };

  const handleDoublePoints = () => {
    if (usedDoubleGlobal || usedDouble || !questionObject || selectedAnswer || reveal) return;
    setUsedDouble(true);
    setUsedDoubleGlobal(true);
    setDoublePointsActivated(true);
    setShowDoubleMessage(true);
  };

  const handleFiftyFifty = () => {
    if (!questionObject || usedFiftyFifty) return;
    const incorrect = answers.filter((a) => a !== questionObject.correctAnswer);
    const toDisable = incorrect.sort(() => 0.5 - Math.random()).slice(0, 2);
    setFiftyDisabled(toDisable);
    setUsedFiftyFifty(true);
  };

  useEffect(() => {
    if (!question || reveal || questionId === null) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setLocalTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [questionId, reveal]);

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <>
      {question && !reveal && (
        <div className="monopoly-timer">{formatTime(localTimer)}⏱️</div>
      )}

      <GameLayout
        question={question}
        answers={answers.filter((a) => !fiftyDisabled.includes(a))}
        selected={selectedAnswer}
        correctAnswer={correctAnswer}
        onAnswerClick={(ans) => handleAnswer(ans, usedDouble)}
        onDoublePoints={handleDoublePoints}
        players={players.map((p) => ({ ...p, score: scores[p.name] || 0 }))}
        showPowerUps={false}
      >
        {isOwner && !question && (
          <button className="start-game-btn" onClick={handleStart}>
            🚀 התחל משחק
          </button>
        )}

        {!reveal && question && (
          <div className="custom-powerups">
            <div className="power-up-btn-wrapper">
              {friendSuggestion && (
                <div className="suggestion-text">
                  🤖 החבר חושב: {friendSuggestion}
                </div>
              )}
              <button
                className={`power-up-btn ${usedFriendHelpGlobal ? "disabled-btn" : ""}`}
                onClick={handleFriendHelp}
                disabled={usedFriendHelpGlobal}
              >
                <span className="emoji">🤖</span>
                <span className="label">עזרת חבר</span>
              </button>
            </div>

            <div className="power-up-btn-wrapper">
              {doublePointsActivated && showDoubleMessage && (
                <div className="feedback-message">🏅 ניקוד כפול הופעל!</div>
              )}
              <button
                className={`power-up-btn ${usedDoubleGlobal ? "disabled-btn" : ""}`}
                onClick={handleDoublePoints}
              >
                <span className="emoji">×2</span>
                <span className="label">הכפלת ניקוד</span>
              </button>
            </div>

            <div className="power-up-btn-wrapper">
              <button
                className={`power-up-btn ${usedFiftyFifty ? "disabled-btn" : ""}`}
                onClick={handleFiftyFifty}
                disabled={usedFiftyFifty}
              >
                <span className="emoji">50/50</span>
              </button>
            </div>
          </div>
        )}

        {reveal && <p>✔️ התשובה הנכונה: {correctAnswer}</p>}
        {gameOver && <h3>🎉 המשחק הסתיים!</h3>}
      </GameLayout>
    </>
  );
}

export default PoloRoom;
