import { useState, useEffect } from 'react';
import type { CardChoice, Card } from '../types';
import { getCardImageUrl } from '../services/cards';

interface CardSelectorProps {
  choices: CardChoice[];
  cards: Card[];
  onSelect: (choice: CardChoice) => void;
  onClose: () => void;
  loading: boolean;
}

export default function CardSelector({ choices, cards, onSelect, onClose, loading }: CardSelectorProps) {
  const [minimized, setMinimized] = useState(true);
  const [everHadCards, setEverHadCards] = useState(false);

  // 跟踪是否曾经出过牌
  useEffect(() => {
    if (choices.length > 0) {
      setEverHadCards(true);
    }
  }, [choices]);

  // 当新的 choices 到达或 loading 时，自动展开
  useEffect(() => {
    if (choices.length > 0 || loading) {
      setMinimized(false);
    }
  }, [choices, loading]);

  const handleMinimize = () => {
    setMinimized(true);
    onClose();
  };

  const handleExpand = () => {
    setMinimized(false);
  };

  const handleSelect = (choice: CardChoice) => {
    onSelect(choice);
    // 选中后关闭弹窗（最小化）
    setMinimized(true);
    onClose();
  };

  // 从未出过牌 + 不在 loading：显示提示
  const showEmpty = !loading && choices.length === 0 && !everHadCards;
  // 有内容或 loading 或出过牌但 choices 已清空（选完牌后）
  const hasContent = loading || choices.length > 0;

  // 折叠状态：右下角圆形按钮（始终可能显示）
  if (minimized && (hasContent || showEmpty)) {
    return (
      <button
        onClick={handleExpand}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 animate-bounce"
        title="展开卡牌选择"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <line x1="9" y1="9" x2="15" y2="15" />
          <line x1="15" y1="9" x2="9" y2="15" />
        </svg>
      </button>
    );
  }

  // 空状态：未出过牌时显示提示
  if (showEmpty) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={handleMinimize}>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-[90vw] max-w-4xl"
          onClick={(e) => e.stopPropagation()}>
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              🎴 卡牌回复
            </h3>
            <button
              onClick={handleMinimize}
              className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 flex items-center justify-center text-lg transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400 dark:text-zinc-500">
            <p className="text-5xl mb-4">🃏</p>
            <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400">还没有出过牌</p>
            <p className="text-sm mt-2">在对话中加入消息后，点击"AI 出牌"让 AI 为你推荐卡牌</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleMinimize}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        {/* 头部 */}
        <div className="sticky top-0 bg-white dark:bg-zinc-900 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            {loading ? 'AI 正在选牌...' : '🎴 选择一张卡牌回复'}
          </h3>
          <button
            onClick={handleMinimize}
            className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 flex items-center justify-center text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="flex gap-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-48 h-64 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
              <span className="text-sm text-zinc-400 dark:text-zinc-500">AI 正在从 588 张卡牌中选择...</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {choices.map((choice, i) => {
                const imageUrl = getCardImageUrl(cards, choice.name);
                return (
                  <button
                    key={choice.name}
                    onClick={() => handleSelect(choice)}
                    className="group relative rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 hover:border-amber-400 dark:hover:border-amber-500/50 hover:bg-white dark:hover:bg-zinc-700/80 transition-all duration-300 text-left hover:-translate-y-1 hover:shadow-xl overflow-hidden"
                  >
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
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-700 rounded px-2 py-0.5 shrink-0 font-mono">
                          #{i + 1}
                        </span>
                        <span className="text-base font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors truncate">
                          {choice.name}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                        {choice.reason}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
