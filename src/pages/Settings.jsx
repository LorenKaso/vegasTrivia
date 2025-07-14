import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

function Settings() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  const avatars = [
    "/images/monopoly1.png",
    "/images/monopoly2.png",
    "/images/monopoly3.png",
    "/images/monopoly4.png",
    "/images/monopoly5.png"
  ];

  useEffect(() => {
    const savedName = localStorage.getItem("playerName") || "";
    const savedAvatar = localStorage.getItem("avatar") || "";
    setName(savedName);
    setAvatar(savedAvatar);
  }, []);

  const handleSave = () => {
    if (!name || !avatar) {
      alert("יש להזין שם ולבחור דמות");
      return;
    }
    localStorage.setItem("playerName", name);
    localStorage.setItem("avatar", avatar);
    alert("הפרופיל עודכן בהצלחה!");
    navigate("/home");
  };

  return (
    <div className="settings-page">
      <div className="settings-content">
        <h2>הגדרות פרופיל</h2>

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

        <button className="start-btn" onClick={handleSave}>שמור</button>
      </div>
    </div>
  );
}

export default Settings;
