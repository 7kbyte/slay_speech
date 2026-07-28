import { useState } from 'react';

interface IntentInputProps {
  onSubmit: (intent: string) => void;
  disabled: boolean;
}

export default function IntentInput({ onSubmit, disabled }: IntentInputProps) {
  const [intent, setIntent] = useState('');

  const handleSubmit = () => {
    if (intent.trim() && !disabled) {
      onSubmit(intent.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-1.5 sm:gap-2">
      <input
        type="text"
        value={intent}
        onChange={(e) => setIntent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入你想表达的意思..."
        disabled={disabled}
        className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 text-base text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500/50 transition-colors disabled:opacity-50"
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !intent.trim()}
        className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-300 text-base font-medium hover:bg-amber-100 dark:hover:bg-amber-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
      >
        出牌
      </button>
    </div>
  );
}
