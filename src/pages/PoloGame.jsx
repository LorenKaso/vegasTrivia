import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useSocket from "../hooks/useSocket";
import GameLayout from "../components/GameLayout";
import "../components/GameLayout.css";
import "./PoloGame.css";

function PoloGame() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [roomId, setRoomId] = useState("");
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [selected, setSelected] = useState(null);
  const [question, setQuestion] = useState("ממתין להתחלה...");
  const [answers, setAnswers] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [redirectMsg, setRedirectMsg] = useState("");
  const isOwner = useRef(false);

  // קבלת פרטי שחקן
  const name = localStorage.getItem("playerName");
  const avatar = localStorage.getItem("avatar");

  // יצירת roomId אם לא קיים
  useEffect(() => {
    let id = searchParams.get("room");
    if (!id) {
      id = Math.random().toString(36).substring(2, 8);
      window.history.replaceState(null, "", `/polo?room=${id}`);
      isOwner.current = true;
    }
    setRoomId(id);
  }, []);

  // חיבור לסוקט
  const { sendMessage, isReady } = useSocket((data) => {
    if (data.type === "gameStarted") {
      navigate(`/polo-room?roomId=${roomId}`);
    }

    if (data.type === "start_game") {
      setQuestion(data.question);
      setAnswers(data.answers);
      setCorrectAnswer(data.correctAnswer);
      setGameStarted(true);
    }

    if (data.type === "player_list") {
      setPlayers(data.players);
    }
  }, roomId);

  // שליחת הודעת הצטרפות ברגע שהסוקט מוכן
  useEffect(() => {
    if (!isReady || !roomId) return;

    const name = localStorage.getItem("playerName");
    const avatar = localStorage.getItem("avatar");

    if (!name || !avatar) {
      setRedirectMsg("אנא בחר שם ואווטאר כדי להצטרף למשחק 🎭");
      navigate(`/profile?redirect=polo&room=${roomId}`);
      return;
    }

    sendMessage({
      type: "join",
      player: { name, avatar },
    });
  }, [isReady, roomId]);

  const handleAnswerClick = (answer) => {
    setSelected(answer);
    sendMessage({ type: "answer", answer, name });
  };

  const handleStartGame = () => {
    sendMessage({ type: "startGame" });
  };

  const shareLink = `${window.location.origin}/polo?room=${roomId}`;

  return (
    <div className={gameStarted ? "game-layout-body" : "polo-container"}>
      {!gameStarted ? (
        <div className="polo-card">
          <h2>חדר: {roomId}</h2>

          {redirectMsg && (
            <div className="redirect-msg">{redirectMsg}</div>
          )}

          <p>👥 שחקנים:</p>
          <div className="player-list">
            {players.map((p, i) => (
              <div key={i} className="player-card">
                <img src={p.avatar} alt="avatar" />
                <span>{p.name}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigator.clipboard.writeText(shareLink)}
            className="share-btn"
          >
            🔗 העתק קישור לחדר
          </button>

          {isOwner.current ? (
            <button onClick={handleStartGame} className="share-btn start-btn">
              🚀 התחל משחק
            </button>
          ) : (
            <div className="waiting-message">
              ממתינים שהמנהל יתחיל את המשחק 🎮
            </div>
          )}
        </div>
      ) : (
        <GameLayout
          question={question}
          answers={answers}
          selected={selected}
          correctAnswer={correctAnswer}
          onAnswerClick={handleAnswerClick}
        />
      )}
    </div>
  );
}

export default PoloGame;
