import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileSetup.css";

function ProfileSetup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  const avatars = [
    "/images/monopoly1.png",
    "/images/monopoly2.png",
    "/images/monopoly3.png"
  ];

  const handleStart = () => {
    if (!name || !avatar) {
      alert("יש להזין שם ולבחור דמות");
      return;
    }
    localStorage.setItem("playerName", name);
    localStorage.setItem("avatar", avatar);
    navigate("/home");
  };

  return (
    <div className="profile-setup">
      <h2>ברוך הבא למשחק הטריוויה</h2>
      <p>בחר שם ודמות להתחלת המשחק</p>

      <input
        type="text"
        placeholder="שם שחקן..."
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <h3>בחר דמות:</h3>
      <div className="avatar-grid">
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

      <button className="start-btn" onClick={handleStart}>המשך למשחק</button>
    </div>
  );
}

export default ProfileSetup;