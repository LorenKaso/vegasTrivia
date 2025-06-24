import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./GameLayout.css";

function GameLayout({
  question,
  answers,
  selected,
  correctAnswer,
  onAnswerClick,
  children,
}) {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [flashAnswer, setFlashAnswer] = useState(null);

  useEffect(() => {
    if (selected) {
      setFlashAnswer(selected);
      const timer = setTimeout(() => setFlashAnswer(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [selected]);

  return (
    <div className="game-layout-body">
      <button id="back-to-home-btn" onClick={() => setShowPopup(true)}>
        חזור לדף הבית
      </button>

      <div className="game-content-wrapper">
        <div className="card">
          <h2>{question}</h2>
        </div>

        <div className="answers-grid">
          {answers.map((answer) => {
            const isCorrect = answer === correctAnswer;
            const isWrong = selected && answer === selected && !isCorrect;
            const shouldFlash = answer === flashAnswer;

            let className = "answer-card";

            if (selected) {
              if (isCorrect) className += " correct-answer";
              if (isWrong) className += " wrong-answer";
            }

            if (shouldFlash) className += " flash";

            return (
              <div
                key={answer}
                className={className}
                onClick={() => !selected && onAnswerClick(answer)}
              >
                {answer}
              </div>
            );
          })}
        </div>

        {children}
      </div>

      {showPopup && (
        <div
          className="popup-overlay"
          onClick={(e) => {
            if (e.target.classList.contains("popup-overlay")) {
              setShowPopup(false);
            }
          }}
        >
          <div className="popup-buttons">
            <button id="confirm-exit-btn" onClick={() => navigate("/home")}>
              צא למסך הבית
            </button>
            <button id="cancel-exit-btn" onClick={() => setShowPopup(false)}>
              הישאר במשחק
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameLayout;
