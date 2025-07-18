import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useSocket from "../hooks/useSocket";
import "./PoloGame.css";

function PoloGame() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [roomId, setRoomId] = useState("");
  const [players, setPlayers] = useState([]);
  const isOwner = useRef(false);

  const name = localStorage.getItem("playerName");
  const avatar = localStorage.getItem("avatar");

  useEffect(() => {
    if (!name || !avatar) {
      const currentRoomId = searchParams.get("roomId") || "";
      navigate(`/profile?redirect=polo&roomId=${currentRoomId}`);
    }
  }, []);

  const { sendMessage, isReady } = useSocket((data) => {
    if (data.type === "game_starting") {
      navigate(`/poloroom?roomId=${roomId}`);
    }

    if (data.type === "player_list") {
      setPlayers(data.players);
    }
  }, roomId);

  const handleStartGame = () => {
    sendMessage({ type: "start_game" });
  };

  useEffect(() => {
    let id = searchParams.get("roomId");
    if (!id) {
      id = Math.random().toString(36).substring(2, 8);
      window.history.replaceState(null, "", `/polo?roomId=${id}`);
      isOwner.current = true;
      localStorage.setItem("isOwner", "true");
    } else {
      isOwner.current = localStorage.getItem("isOwner") === "true";
    }
    setRoomId(id);
  }, []);

  useEffect(() => {
    if (!isReady || !roomId) return;

    if (!name || !avatar) {
      navigate(`/profile?redirect=polo&roomId=${roomId}`);
      return;
    }

    sendMessage({
      type: "join",
      name,
      avatar,
    });
  }, [isReady, roomId]);

  const shareLink = `${window.location.origin}/polo?roomId=${roomId}`;

  return (
    <div className="polo-container">
      <div className="polo-card">
        <h2>חדר: {roomId}</h2>
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
            🎮 ממתינים שהמנהל יתחיל את המשחק
          </div>
        )}
      </div>
    </div>
  );
}

export default PoloGame;
