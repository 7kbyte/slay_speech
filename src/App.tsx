import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ThemeToggle from './components/ThemeToggle';
import ChatPage from './pages/ChatPage';
import CardsPage from './pages/CardsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 transition-colors">
        <Navbar />
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/cards" element={<CardsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
        <ThemeToggle />
      </div>
    </HashRouter>
  );
}

export default App;
