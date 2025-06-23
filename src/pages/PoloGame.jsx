import { useNavigate } from "react-router-dom";
import { useState } from "react";
import GameLayout from "../components/GameLayout";
import "../components/GameLayout.css";
import "./PoloGame.css";

function PoloGame() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const question = "איזו מדינה נמצאת באפריקה?";
  const answers = ["קנדה", "ברזיל", "צרפת", "מצרים"];
  const correctAnswer = "מצרים";

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

export default PoloGame;
