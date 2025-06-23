function GameLayout({ question, answers, selected, correctAnswer, onAnswerClick }) {
  return (
    <div className="game-content-wrapper">
      <div className="card">
        <h2>{question}</h2>
      </div>

      <div className="answers-grid">
        {answers.map((answer) => (
          <div
            key={answer}
            className={`answer-card ${
              selected
                ? answer === correctAnswer
                  ? "correct-answer"
                  : answer === selected
                  ? "wrong-answer"
                  : ""
                : ""
            }`}
            onClick={() => !selected && onAnswerClick(answer)}
          >
            {answer}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GameLayout;
