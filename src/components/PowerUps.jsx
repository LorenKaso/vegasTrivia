import "./PowerUps.css";

function PowerUps({ onFiftyFifty, onDoublePoints, onHelp, helpSuggestion }) {
  return (
    <div className="power-ups-bar">
      <div className="power-up-btn-wrapper">
        <button className="power-up-btn" onClick={onHelp}>
          <span className="emoji">🤖</span>
          <span className="label">עזרת חבר</span>
        </button>
        {helpSuggestion && (
          <div className="suggestion-text">
            החבר חושב: {helpSuggestion}
          </div>
        )}
      </div>

      <button className="power-up-btn" onClick={onDoublePoints}>
        <span className="emoji">×2</span>
        <span className="label">הכפלת ניקוד</span>
      </button>

      <button className="power-up-btn" onClick={onFiftyFifty}>
        <span className="emoji">50/50</span>
        <span className="label">50/50</span>
      </button>
    </div>
  );
}

export default PowerUps;
