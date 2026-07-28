import type { CardChoice, Card } from '../types';
import { getCardImageUrl } from '../services/cards';

interface CardSelectorProps {
  choices: CardChoice[];
  cards: Card[];
  onSelect: (choice: CardChoice) => void;
  loading: boolean;
}

export default function CardSelector({ choices, cards, onSelect, loading }: CardSelectorProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 py-4">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-40 h-44 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <span className="text-sm text-zinc-400 dark:text-zinc-500">AI 正在选牌...</span>
      </div>
    );
  }

  if (choices.length === 0) return null;

  return (
    <div className="py-2">
      <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-500 mb-3">🎴 选择一张卡牌回复：</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {choices.map((choice, i) => {
          const imageUrl = getCardImageUrl(cards, choice.name);
          return (
            <button
              key={choice.name}
              onClick={() => onSelect(choice)}
              className="group relative rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 hover:border-amber-400 dark:hover:border-amber-500/50 hover:bg-white dark:hover:bg-zinc-700/80 transition-all duration-300 text-left hover:-translate-y-0.5 hover:shadow-lg overflow-hidden"
            >
              {/* 卡牌图片 */}
              {imageUrl && (
                <div className="w-full aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                  <img
                    src={imageUrl}
                    alt={choice.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
                  <span className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-700 rounded px-1.5 py-0.5 shrink-0">
                    #{i + 1}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors truncate">
                    {choice.name}
                  </span>
                </div>
                <p className="text-[11px] sm:text-sm text-zinc-500 leading-relaxed line-clamp-2">
                  {choice.reason}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
