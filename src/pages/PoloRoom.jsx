import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useSocket from "../hooks/useSocket";
import Scoreboard from "../components/Scoreboard";
import Timer from "../components/Timer";
import PowerUps from "../components/PowerUps";
import "./PoloRoom.css";

function PoloRoom() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get("roomId") || "";
  const [players, setPlayers] = useState([]);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [reveal, setReveal] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [fastest, setFastest] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [powerUsed, setPowerUsed] = useState({ double: false, fifty: false, phone: false });

  const socket = useSocket();
  const playerName = localStorage.getItem("playerName") || "אנונימי";
  const avatar = localStorage.getItem("avatar") || "";
  const hasAnswered = useRef(false);
  const isOwner = localStorage.getItem("isOwner") === "true";

  useEffect(() => {
    if (!socket) return;

    socket.send(
      JSON.stringify({
        type: "join",
        roomId,
        name: playerName,
        avatar,
      })
    );

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "player_list") {
        setPlayers(data.players);
      }

      if (data.type === "question") {
        setQuestion(data.question);
        setAnswers(data.answers);
        setReveal(false);
        setSelectedAnswer(null);
        hasAnswered.current = false;
      }

      if (data.type === "reveal") {
        setReveal(true);
        setCorrectAnswer(data.correctAnswer);
        setFastest(data.fastest);
        setPlayers(data.players);
      }

      if (data.type === "game_over") {
        setPlayers(data.players);
        setGameOver(true);
      }
    };
  }, [socket]);

  const handleAnswer = (answer) => {
    if (hasAnswered.current || reveal || !socket) return;
    hasAnswered.current = true;
    setSelectedAnswer(answer);
    socket.send(
      JSON.stringify({
        type: "answer",
        name: playerName,
        answer,
        double: powerUsed.double,
      })
    );
  };

  const handleStart = () => {
    if (!isOwner) return;
    socket.send(JSON.stringify({ type: "start_game" }));
  };

  const handleUsePower = (type) => {
    if (powerUsed[type]) return;

    if (type === "fifty") {
      const correct = answers.find((a) => a === correctAnswer);
      const wrongs = answers.filter((a) => a !== correctAnswer);
      const keep = [correct, wrongs[Math.floor(Math.random() * wrongs.length)]];
      setAnswers(shuffle(keep));
    }

    if (type === "phone") {
      const rand = Math.random();
      const fakeAnswer = answers[Math.floor(Math.random() * answers.length)];
      const phoneAnswer = rand < 0.7 ? correctAnswer : fakeAnswer;
      alert(`החבר שלך חושב שהתשובה היא: ${phoneAnswer}`);
    }

    setPowerUsed({ ...powerUsed, [type]: true });
  };

  const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

  return (
    <div className="game-layout">
      <div className="header">
        <h2>חדר: {roomId}</h2>
        {isOwner && <button onClick={handleStart}>התחל משחק</button>}
      </div>

      <Scoreboard players={players} />
      <Timer duration={30} trigger={question} />

      <div className="question-card">
        <h3>{question}</h3>
        <div className="answers">
          {answers.map((ans, i) => (
            <button
              key={i}
              className={`answer-btn ${reveal && ans === correctAnswer ? "correct" : ""} ${selectedAnswer === ans && !reveal ? "selected" : ""}`}
              onClick={() => handleAnswer(ans)}
              disabled={reveal}
            >
              {ans}
            </button>
          ))}
        </div>
      </div>

      <PowerUps used={powerUsed} onUse={handleUsePower} />

      {reveal && (
        <div className="result-info">
          <p>התשובה הנכונה: {correctAnswer}</p>
          {fastest && <p>העונה הכי מהיר: {fastest}</p>}
        </div>
      )}

      {gameOver && <h2>המשחק הסתיים!</h2>}
    </div>
  );
}

export default PoloRoom;
