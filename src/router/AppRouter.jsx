import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Home from '../pages/Home';

function MonoGame() {
  return <h1>מסך מונו טריוויה</h1>;
}

function PoloGame() {
  return <h1>מסך פולו טריוויה</h1>;
}

function GlobalGame() {
  return <h1>מסך עולמי טריוויה</h1>;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/mono" element={<MonoGame />} />
        <Route path="/polo" element={<PoloGame />} />
        <Route path="/global" element={<GlobalGame />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
