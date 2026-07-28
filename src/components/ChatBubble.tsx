import type { Message, Card } from '../types';
import { getCardImageUrl } from '../services/cards';

interface ChatBubbleProps {
  message: Message;
  onDelete: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
  cards?: Card[];
}

export default function ChatBubble({ message, onDelete, dragHandleProps, isDragging, cards }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const cardImageUrl = message.cardName && cards ? getCardImageUrl(cards, message.cardName) : undefined;

  return (
    <div
      className={`flex gap-2 sm:gap-3 group ${isUser ? 'flex-row-reverse' : ''} ${
        isDragging ? 'opacity-50' : ''
      } transition-opacity`}
    >
      {/* 拖拽手柄 - 移动端始终显示，PC端 hover 显示 */}
      <div
        {...dragHandleProps}
        className="flex items-center cursor-grab active:cursor-grabbing touch-none shrink-0 opacity-30 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        title="拖动排序"
      >
        <div className="w-5 h-5 flex items-center justify-center text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="3" cy="2" r="1.2" />
            <circle cx="9" cy="2" r="1.2" />
            <circle cx="3" cy="6" r="1.2" />
            <circle cx="9" cy="6" r="1.2" />
            <circle cx="3" cy="10" r="1.2" />
            <circle cx="9" cy="10" r="1.2" />
          </svg>
        </div>
      </div>

      {/* 头像 */}
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 ${
          isUser ? 'bg-indigo-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-200'
        }`}
      >
        {isUser ? '我' : 'TA'}
      </div>

      {/* 气泡 - 宽屏 */}
      <div className={`max-w-[85%] sm:max-w-[70%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`relative px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-[15px] sm:text-base leading-relaxed ${
            isUser
              ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-100 rounded-tr-md'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-tl-md'
          }`}
        >
          {message.cardName ? (
            cardImageUrl ? (
              <div className="flex items-start gap-2 sm:gap-3">
                <img
                  src={cardImageUrl}
                  alt={message.cardName}
                  className="w-20 sm:w-28 rounded-lg shrink-0 shadow-md"
                  loading="lazy"
                />
                <div>
                  <div className="text-[11px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400 mb-0.5 sm:mb-1">
                    {message.cardName}
                  </div>
                  <span className="whitespace-pre-wrap break-words">{message.content}</span>
                </div>
              </div>
            ) : (
              <>
                <span className="inline-block mr-2 px-1.5 py-0.5 text-[10px] sm:text-[11px] rounded bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium">
                  {message.cardName}
                </span>
                <span className="whitespace-pre-wrap break-words">{message.content}</span>
              </>
            )
          ) : (
            <span className="whitespace-pre-wrap break-words">{message.content}</span>
          )}

          {/* 删除按钮 - 移动端始终可见，PC端 hover 显示 */}
          <button
            onClick={() => onDelete(message.id)}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white dark:bg-zinc-800 hover:bg-red-100 dark:hover:bg-red-500/60 text-zinc-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-300 flex items-center justify-center text-[10px] sm:opacity-0 group-hover:opacity-100 transition-all"
            title="删除"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
