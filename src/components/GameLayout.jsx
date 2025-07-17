import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./GameLayout.css";
import Scoreboard from "./Scoreboard";
import PowerUps from "./PowerUps";

function GameLayout({
  question,
  answers,
  selected,
  correctAnswer,
  onAnswerClick,
  onDoublePoints,
  onFiftyFifty,
  onHelp,
  helpSuggestion,
  disabledAnswers = [],
  doublePointsActivated = false,
  usedDoublePointsGlobal = false,
  usedFiftyFiftyGlobal = false,
  usedFriendHelpGlobal = false,
  players = [],
  showScoreboard = true,
  showPowerUps = true,
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

  const handleAnswerClick = (answer) => {
    if (!selected && !disabledAnswers.includes(answer)) {
      onAnswerClick(answer);
    }
  };

  return (
    <>
      <div className="game-layout-body">
        <button id="back-to-home-btn" onClick={() => setShowPopup(true)}>
          חזור לדף הבית
        </button>

        <div className="game-content-wrapper">
          <div className="card">
            <h2
              style={{
                fontSize: question.split(" ").length > 8 ? "0.9rem" : "1.2rem",
              }}
            >
              {question}
            </h2>
          </div>

          {doublePointsActivated && (
            <div className="double-points-indicator">
              ✨ ניקוד כפול הופעל לשאלה זו!
            </div>
          )}

          <div className="answers-grid">
            {answers.map((answer) => {
              const isCorrect = answer === correctAnswer;
              const isWrong = selected && answer === selected && !isCorrect;
              const shouldFlash = answer === flashAnswer;
              const isDisabled = disabledAnswers.includes(answer);

              let className = "answer-card";

              if (selected) {
                if (isCorrect) className += " correct-answer";
                if (isWrong) className += " wrong-answer";
              }

              if (shouldFlash) className += " flash";
              if (isDisabled) className += " disabled";

              return (
                <div
                  key={answer}
                  className={className}
                  onClick={() => handleAnswerClick(answer)}
                >
                  {answer}
                </div>
              );
            })}
          </div>

          {children}
        </div>
      </div>

      {showPowerUps && (
        <PowerUps
          onFiftyFifty={onFiftyFifty}
          onHelp={onHelp}
          onDoublePoints={onDoublePoints}
          helpSuggestion={helpSuggestion}
          usedFiftyFiftyGlobal={usedFiftyFiftyGlobal}
          usedFriendHelpGlobal={usedFriendHelpGlobal}
          usedDoublePointsGlobal={usedDoublePointsGlobal}
        />
      )}

      {showScoreboard && <Scoreboard players={players} />}

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
    </>
  );
}

export default GameLayout;
