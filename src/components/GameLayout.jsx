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
  children,
  players = [],
  showScoreboard = true,
}) {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [flashAnswer, setFlashAnswer] = useState(null);
  const [disabledAnswers, setDisabledAnswers] = useState([]);
  const [helpSuggestion, setHelpSuggestion] = useState(null);

  useEffect(() => {
    if (selected) {
      setFlashAnswer(selected);
      const timer = setTimeout(() => setFlashAnswer(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [selected]);

  //clean llm answer
  useEffect(() => {
    setHelpSuggestion("");
  }, [question]);


  const handleFiftyFifty = () => {
    const incorrectAnswers = answers.filter(ans => ans !== correctAnswer);
    const shuffled = incorrectAnswers.sort(() => 0.5 - Math.random());
    const answersToRemove = shuffled.slice(0, 2);

    setDisabledAnswers(answersToRemove);
  };

  const handleHelp = () => {
    const random = Math.random();
    let suggestion;

    if (random <= 0.8) {
      // 80% מהפעמים - החבר בוחר את התשובה הנכונה
      suggestion = correctAnswer;
    } else {
      // 20% מהפעמים - החבר בוחר תשובה שגויה אקראית
      const wrongAnswers = answers.filter(ans => ans !== correctAnswer);
      suggestion = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
    }
    setHelpSuggestion(suggestion);
  };

  const handleAnswerClick = (answer) => {
    if (!selected && !disabledAnswers.includes(answer)) {
      setHelpSuggestion("");  // מוחק את הטקסט של החבר אחרי בחירה בתשובה
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
                  onClick={() => !selected && !isDisabled && onAnswerClick(answer)}
                >
                  {answer}
                </div>
              );
            })}
          </div>

          {children}
        </div>
      </div>

 
      {/* עזרי המשחק */}
      <PowerUps onFiftyFifty={handleFiftyFifty} 
                onHelp={handleHelp} 
                onDoublePoints={onDoublePoints}
                helpSuggestion={helpSuggestion}
      />
                
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
            <button id="confirm-exit-btn" onClick={() => navigate("/home")}>צא למסך הבית</button>
            <button id="cancel-exit-btn" onClick={() => setShowPopup(false)}>הישאר במשחק</button>
          </div>
        </div>
      )}
    </>
  );
}

export default GameLayout;
