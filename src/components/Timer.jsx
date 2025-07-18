import { useEffect } from "react";
import "./Timer.css";

function Timer({ timeLeft }) {
  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="monopoly-timer">
      {formatTime(timeLeft)}
    </div>
  );
}

export default Timer;
