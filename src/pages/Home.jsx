import "./Home.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    setTimeout(() => navigate(path), 700);
  };

  return (
    <div className="home-body">
      <div className="curtains left"></div>
      <div className="curtains right"></div>

      <div className="home-screen show">
        <div className="content-wrapper">
          <div className="home-title">VegasTrivia</div>
          <div className="button-group">
            <button
              className="fade-transition"
              onClick={() => handleNavigate("/mono")}
              onMouseEnter={(e) => {
                e.target.dataset.original = e.target.innerText;
                e.target.innerText = "משחק יחיד מול המחשב";
              }}
              onMouseLeave={(e) => {
                e.target.innerText = e.target.dataset.original;
              }}
            >
              🤖 מונו-טריוויה
            </button>

            <button
              className="fade-transition"
              onClick={() => handleNavigate("/polo")}
              onMouseEnter={(e) => {
                e.target.dataset.original = e.target.innerText;
                e.target.innerText = "משחק קבוצתי עם חברים עד 5 משתתפים";
              }}
              onMouseLeave={(e) => {
                e.target.innerText = e.target.dataset.original;
              }}
            >
              👥 פולו-טריוויה
            </button>

            <button
              className="fade-transition"
              onClick={() => handleNavigate("/global")}
              onMouseEnter={(e) => {
                e.target.dataset.original = e.target.innerText;
                e.target.innerText = "שחקנים מכל העולם";
              }}
              onMouseLeave={(e) => {
                e.target.innerText = e.target.dataset.original;
              }}
            >
              🌍 עולמי-טריוויה
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
