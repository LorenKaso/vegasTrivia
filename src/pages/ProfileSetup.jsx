import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileSetup.css";

function ProfileSetup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [nameError, setNameError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const avatars = [
    "/images/b1.png",
    "/images/m1.png",
    "/images/m2.png",
    "/images/w1.png",
    "/images/w2.png"
  ];

  const handleStart = () => {
    let hasError = false;
    if (!name.trim()) {
      setNameError(true);
      hasError = true;
    } else {
      setNameError(false);
    }

    if (!avatar) {
      setAvatarError(true);
      hasError = true;
    } else {
      setAvatarError(false);
    }

    if (hasError) return;

    localStorage.setItem("playerName", name);
    localStorage.setItem("avatar", avatar);

    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect") || "home";
    const room = params.get("room");

    if (room) {
      navigate(`/${redirect}?room=${room}`);
    } else {
      navigate(`/${redirect}`);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>ברוך הבא!</h2>
        <p>בחר שם ודמות כדי להתחיל לשחק</p>

        <input
          type="text"
          placeholder="הכנס שם שחקן"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {nameError && <p className="error-msg">אנא הזן שם</p>}

        <h3>בחר דמות:</h3>
        <div className="avatar-selection">
          {avatars.map((img) => (
            <img
              key={img}
              src={img}
              alt="avatar"
              className={avatar === img ? "selected" : ""}
              onClick={() => setAvatar(img)}
            />
          ))}
        </div>
        {avatarError && <p className="error-msg">יש לבחור דמות</p>}

        <button className="start-button" onClick={handleStart}>
          שמור 
        </button>
      </div>
    </div>
  );
}

export default ProfileSetup;
