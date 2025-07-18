import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/FinalScoreboard.css";

function HighScore() {
  const [highScores, setHighScores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const playerName = localStorage.getItem("playerName") || "אנונימי";
    const avatar = localStorage.getItem("avatar") || "/images/default-avatar.png";
    const currentScore = Number(localStorage.getItem("lastMonoScore") || 0);

    if (!currentScore || isNaN(currentScore)) return;

    const saved = JSON.parse(localStorage.getItem("monoHighScores")) || [];
    const newEntry = { name: playerName, score: currentScore, avatar };

    const updated = [...saved, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    localStorage.setItem("monoHighScores", JSON.stringify(updated));
    setHighScores(updated);
  }, []);

  return (
    <div className="profile-setup-container">
      <div className="profile-card">
        <h2 className="scoreboard-title">שיאים אישיים</h2>
        <div className="score-list">
          {highScores.map((entry, index) => (
            <div className="score-row" key={index}>
               <span className="rank">{index + 1}.</span>
              <span className="score-name">{entry.name}</span>
              <img
                src={entry.avatar || "/images/default-avatar.png"}
                className="score-avatar"
                alt="avatar"   
              />
              <span className="score-points">{entry.score} נק'</span>
            </div>
          ))}
        </div>
         <div className="last-score-box">
          <h3>הניקוד הנוכחי שלך:</h3>
          <p>{localStorage.getItem("lastMonoScore")} נק'</p>
        </div>

        <button className="home-button" onClick={() => navigate("/home")}>
          חזרה לדף הבית
        </button>
      </div>
    </div>
  );
}

export default HighScore;
