import "./PowerUps.css";

function PowerUps({
  onFiftyFifty,
  onDoublePoints,
  onHelp,
  helpSuggestion,
  usedFiftyFiftyGlobal,
  usedFriendHelpGlobal,
  usedDoublePointsGlobal
}) {
  return (
    <div className="power-ups-bar">
      <div className="power-up-btn-wrapper">
        <button
          className={`power-up-btn ${usedFriendHelpGlobal ? "disabled-btn" : ""}`}
          onClick={onHelp}
          disabled={usedFriendHelpGlobal}
        >
          <span className="emoji">🤖</span>
          <span className="label">עזרת חבר</span>
        </button>
        {helpSuggestion && (
          <div className="suggestion-text">
            החבר חושב: {helpSuggestion}
          </div>
        )}
      </div>

      <button
        className={`power-up-btn ${usedDoublePointsGlobal ? "disabled-btn" : ""}`}
        onClick={onDoublePoints}
        disabled={usedDoublePointsGlobal}
      >
        <span className="emoji">×2</span>
        <span className="label">הכפלת ניקוד</span>
      </button>

      <button
        className={`power-up-btn ${usedFiftyFiftyGlobal ? "disabled-btn" : ""}`}
        onClick={onFiftyFifty}
        disabled={usedFiftyFiftyGlobal}
      >
        <span className="emoji">50/50</span>
        <span className="label">50/50</span>
      </button>
    </div>
  );
}

export default PowerUps;
