import { useNavigate } from "react-router-dom";
import { useState } from "react";
import GameLayout from "../components/GameLayout";
import "../components/GameLayout.css";
import "./GlobalGame.css";

function GlobalGame() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const question = "מהו האוקיינוס הגדול ביותר בעולם?";
  const answers = ["האטלנטי", "ההודי", "השקט", "הקרח הצפוני"];
  const correctAnswer = "השקט";

  const handleAnswerClick = (answer) => {
    setSelected(answer);
  };

  return (
    <div className="game-layout-body">
     
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

export default GlobalGame;
