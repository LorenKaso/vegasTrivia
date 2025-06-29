import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Home from '../pages/Home';
import MonoGame from "../pages/MonoGame";
import PoloGame from "../pages/PoloGame";
import GlobalGame from "../pages/GlobalGame";
import ProfileSetup from "../pages/ProfileSetup"; // חובה להוסיף
import Settings from "../pages/Settings"; // חובה להוסיף

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<ProfileSetup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/mono" element={<MonoGame />} />
        <Route path="/polo" element={<PoloGame />} />
        <Route path="/global" element={<GlobalGame />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
