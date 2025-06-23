import { useNavigate } from "react-router-dom";
import { useState } from "react";
import GameLayout from "../components/GameLayout";
import "../components/GameLayout.css";
import "./MonoGame.css";

function MonoGame() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const question = "מה בירת צרפת?";
  const answers = ["פריז", "לונדון", "בריסל", "רומא"];
  const correctAnswer = "פריז";

  const handleAnswerClick = (answer) => {
    setSelected(answer);
  };

  return (
    <div className="game-layout-body">
      <button id="back-to-home-btn" onClick={() => navigate("/home")}>
        דף הבית
      </button>

      <GameLayout
        question={question}
        answers={answers}
        selected={selected}
        correctAnswer={correctAnswer}
        onAnswerClick={handleAnswerClick}
      />
    </div>
  );
}

export default MonoGame;
