import { useNavigate } from "react-router-dom";
import "./FinalScoreboard.css";

function FinalScoreboard({ players, title = "טבלת סיכום" }) {
  const navigate = useNavigate();

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="profile-setup-container">
      <div className="profile-card summary-mode">
        <h2 className="scoreboard-title">{title}</h2>

        <div className="score-list">
        {sortedPlayers.map((player, index) => (
            <div className="score-row" key={index}>
            <span className="rank">{index + 1}.</span>
            <img
                src={player.avatar || "/images/b1.png"}
                alt="avatar"
                className="avatar"
            />
            <span className="score-name">{player.name}</span>
            <span className="score-points">{player.score} נק'</span>
            </div>
        ))}
        </div>


        <button className="home-button" onClick={() => navigate("/home")}>
          חזרה לדף הבית
        </button>
      </div>
    </div>
  );
}

export default FinalScoreboard;
