import { useEffect, useRef } from "react";
import "./Scoreboard.css";

function Scoreboard({ players }) {
  const prevPlayersRef = useRef([]);

  useEffect(() => {
    prevPlayersRef.current = players;
  }, [players]);

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const prevSorted = [...prevPlayersRef.current].sort((a, b) => b.score - a.score);

  return (
    <div className="scoreboard-overlay">
      <div className="scoreboard-table">
        <h2>לוח תוצאות</h2>
        <table>
          <thead>
            <tr>
              <th>מיקום</th>
              <th>שם</th>
              <th>ניקוד</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => {
              const prevPlayer = prevSorted.find(p => p.id === player.id);
              const prevIndex = prevSorted.findIndex(p => p.id === player.id);
              const movedUp = prevIndex > index;
              const movedDown = prevIndex < index && prevIndex !== -1;
              const scoreChanged = prevPlayer && prevPlayer.score !== player.score;

              return (
                <tr
                  key={player.id || player.name}
                  className={
                    movedUp ? "move-up" :
                    movedDown ? "move-down" :
                    scoreChanged ? "score-change" : ""
                  }
                >
                  <td>{index + 1}</td>      {/* מיקום */}
                  <td>{player.name}</td>     {/* שם */}
                  <td>{player.score}</td>    {/* ניקוד */}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Scoreboard;
