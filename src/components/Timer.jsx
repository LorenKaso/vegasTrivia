import "./Timer.css";

function Timer({ timeLeft }) {
  return (
    <div className="digital-timer-display">
      {timeLeft} שניות
    </div>
  );
}

export default Timer;
