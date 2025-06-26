import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import screenLogin from "../assets/images/screen_login.png";
import "./Login.css";

function Login() {
  const [spinning, setSpinning] = useState(true);
  const [showText, setShowText] = useState(false);
  const [muted, setMuted] = useState(false);
  const navigate = useNavigate();
  const soundRef = useRef(null);

  useEffect(() => {
    const savedName = localStorage.getItem("playerName");
    const savedAvatar = localStorage.getItem("avatar");

    const sound = new Audio("/assets/sounds/slot_machine.mp3");
    sound.volume = 0.5;
    sound.muted = muted;
    sound.play().catch((e) => console.log("שגיאה בהשמעת סאונד:", e));
    soundRef.current = sound;

    const firstTimeout = setTimeout(() => {
      setSpinning(false);

      const secondTimeout = setTimeout(() => {
        setShowText(true);

        const thirdTimeout = setTimeout(() => {
          if (savedName && savedAvatar) {
            navigate("/home");
          } else {
            navigate("/profile");
          }
        }, 1500);

        return () => clearTimeout(thirdTimeout);
      }, 500);

      return () => clearTimeout(secondTimeout);
    }, 2500);

    return () => clearTimeout(firstTimeout);
  }, [navigate, muted]);

  const toggleMute = () => {
    if (soundRef.current) {
      soundRef.current.muted = !soundRef.current.muted;
      setMuted(!muted);
    }
  };

  return (
    <div className="login-container">
      <img src={screenLogin} alt="Slot Machine" className="slot-image" />

      <div className={`slots ${showText ? "hidden" : ""}`}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="slot-window">
            <div className={`reel ${spinning ? "spinning" : ""}`}>
              <div className="symbol">🍎</div>
              <div className="symbol">🍌</div>
              <div className="symbol">🍒</div>
            </div>
          </div>
        ))}
      </div>

      {showText && (
        <h1 className="vegas-text">VegasTrivia</h1>
      )}

      <button className="mute-button" onClick={toggleMute}>
        {muted ? "🔇" : "🔊"}
      </button>
    </div>
  );
}

export default Login;
