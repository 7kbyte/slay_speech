import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const linkClass = (path: string) =>
    `px-3 sm:px-5 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
      location.pathname === path
        ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
        : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
    }`;

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur sticky top-0 z-50 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 shrink-0">
          <span className="text-amber-500">⚔</span>
          <span className="hidden sm:inline">杀戮对话</span>
        </Link>
        <div className="flex gap-1 sm:gap-2">
          <Link to="/" className={linkClass('/')}>
            对话
          </Link>
          <Link to="/cards" className={linkClass('/cards')}>
            牌库
          </Link>
          <Link to="/settings" className={linkClass('/settings')}>
            设置
          </Link>
        </div>
      </div>
    </nav>
  );
}
