import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useStore';
import { selectCards } from '../services/api';
import type { Message, CardChoice } from '../types';
import ChatBubble from '../components/ChatBubble';
import CardSelector from '../components/CardSelector';
import IntentInput from '../components/IntentInput';

export default function ChatPage() {
  const {
    messages,
    cards,
    settings,
    setMessages,
    addMessage,
    deleteMessage,
  } = useAppStore();

  const [choices, setChoices] = useState<CardChoice[]>([]);
  const [thinking, setThinking] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newMsgRole, setNewMsgRole] = useState<'user' | 'other'>('user');
  const [newMsgContent, setNewMsgContent] = useState('');
  const [insertIndex, setInsertIndex] = useState<number | null>(null);

  // 拖拽状态
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, choices, loading]);

  const handleSelectCard = useCallback(
    (choice: CardChoice) => {
      addMessage({
        id: crypto.randomUUID(),
        role: 'other',
        content: choice.name,
        cardName: choice.name,
      });
      setChoices([]);
      setThinking('');
    },
    [addMessage]
  );

  const handleIntent = useCallback(
    async (intent: string) => {
      if (!settings.apiKey) {
        setError('请先在设置中配置 API Key');
        return;
      }

      setError('');
      setLoading(true);
      setChoices([]);
      setThinking('');

      try {
        const conversation = messages.map((m) => ({
          role: m.role === 'user' ? 'A' : 'B',
          content: m.content,
        }));

        const result = await selectCards(conversation, intent, cards);
        setChoices(result.cards);
        setThinking(result.thinking);
      } catch (e) {
        setError(e instanceof Error ? e.message : '未知错误');
      } finally {
        setLoading(false);
      }
    },
    [messages, cards, settings]
  );

  const handleAddManualMessage = () => {
    if (!newMsgContent.trim()) return;
    const msg: Message = {
      id: crypto.randomUUID(),
      role: newMsgRole,
      content: newMsgContent.trim(),
    };
    if (insertIndex !== null && insertIndex < messages.length) {
      // 插入到指定位置
      const newMsgs = [...messages];
      newMsgs.splice(insertIndex + 1, 0, msg);
      setMessages(newMsgs);
    } else {
      addMessage(msg);
    }
    setNewMsgContent('');
    setInsertIndex(null);
  };

  // 通过气泡上的 + 按钮设置插入位置
  const handleSetInsertAfter = (index: number) => {
    setInsertIndex(insertIndex === index ? null : index);
  };

  // 拖拽排序
  const handleDragStart = (idx: number) => {
    setDragIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      setDragOverIdx(idx);
    }
  };

  const handleDragLeave = () => {
    setDragOverIdx(null);
  };

  const handleDrop = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    const newMsgs = [...messages];
    const [moved] = newMsgs.splice(dragIdx, 1);
    newMsgs.splice(targetIdx, 0, moved);
    setMessages(newMsgs);
    setDragIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setDragOverIdx(null);
  };

  // 清空对话
  const handleClear = () => {
    if (window.confirm('确定要清空所有对话吗？')) {
      setMessages([]);
      setChoices([]);
      setThinking('');
      setInsertIndex(null);
    }
  };

  // 创建示例对话
  const handleCreateDemo = () => {
    const demo: Message[] = [
      { id: crypto.randomUUID(), role: 'other', content: '你今天怎么这么慢？' },
      { id: crypto.randomUUID(), role: 'user', content: '我已经尽力了。' },
      { id: crypto.randomUUID(), role: 'other', content: '尽力？这点事都做不好！' },
    ];
    setMessages(demo);
    setChoices([]);
    setThinking('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] flex flex-col">
      {/* 顶部工具栏 */}
      <div className="py-2 sm:py-3 flex items-center justify-between shrink-0">
        <h2 className="text-sm sm:text-base font-medium text-zinc-500 dark:text-zinc-400">对话</h2>
        <div className="flex gap-2">
          {messages.length === 0 && (
            <button
              onClick={handleCreateDemo}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              载入示例
            </button>
          )}
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 dark:text-red-400 transition-colors"
            >
              清空对话
            </button>
          )}
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-16 text-zinc-400 dark:text-zinc-600">
            <p className="text-4xl mb-4">💬</p>
            <p className="text-base">还没有对话，开始构建你的对话场景吧</p>
            <p className="text-sm mt-2 text-zinc-400 dark:text-zinc-700">
              可以先手动添加一些消息，也可以点击"载入示例"
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={msg.id}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(i)}
            onDragEnd={handleDragEnd}
            className={`relative group/message rounded-xl transition-colors ${
              dragOverIdx === i ? 'border-t-2 border-amber-400 dark:border-amber-500/50 pt-2' : ''
            } ${
              insertIndex === i
                ? 'ring-1 ring-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/5'
                : ''
            }`}
          >
            <ChatBubble
              message={msg}
              onDelete={deleteMessage}
              isDragging={dragIdx === i}
              cards={cards}
              dragHandleProps={{
                onMouseDown: () => {
                  // 拖拽手柄不需要额外处理，由父级 draggable 处理
                },
              }}
            />

            {/* 插入位置指示器 */}
            <div className="flex justify-center py-0.5">
              <button
                onClick={() => handleSetInsertAfter(i)}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all ${
                  insertIndex === i
                    ? 'bg-indigo-500 text-white scale-110'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 opacity-0 group-hover/message:opacity-100'
                }`}
                title={insertIndex === i ? '取消在此插入' : '在此后插入'}
              >
                {insertIndex === i ? '−' : '+'}
              </button>
            </div>
          </div>
        ))}

        {/* AI 思考过程 */}
        {thinking && choices.length > 0 && (
          <div className="px-4 py-2 mx-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 leading-relaxed">
            <span className="text-zinc-400 dark:text-zinc-600">💭 思考: </span>
            {thinking}
          </div>
        )}

        {/* 卡牌选择器 */}
        {messages.length > 0 && (
          <div className="px-1">
            <CardSelector
              choices={choices}
              cards={cards}
              onSelect={handleSelectCard}
              loading={loading}
            />
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="px-4 py-2 mx-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400">
            {error}
            <button
              onClick={() => setError('')}
              className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-300"
            >
              ✕
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 底部操作区 */}
      <div className="shrink-0 py-2 sm:py-3 space-y-2 sm:space-y-3 border-t border-zinc-200 dark:border-zinc-800/50 transition-colors">
        {/* 手动添加消息 */}
        <div className="flex gap-2 items-center">
          <select
            value={newMsgRole}
            onChange={(e) => setNewMsgRole(e.target.value as 'user' | 'other')}
            className="px-3 sm:px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/50 focus:outline-none shrink-0"
          >
            <option value="user">我</option>
            <option value="other">TA</option>
          </select>
          <input
            type="text"
            value={newMsgContent}
            onChange={(e) => setNewMsgContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddManualMessage();
            }}
            placeholder={
              insertIndex !== null
                ? `在第 ${insertIndex + 1} 条后插入...`
                : '添加消息（追加到末尾）...'
            }
            className="flex-1 px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 text-base text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
          />
          {insertIndex !== null && (
            <button
              onClick={() => setInsertIndex(null)}
              className="px-2 py-2 text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 shrink-0"
              title="取消指定位置"
            >
              取消
            </button>
          )}
          <button
            onClick={handleAddManualMessage}
            disabled={!newMsgContent.trim()}
            className="px-4 sm:px-5 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 text-sm sm:text-base font-medium disabled:opacity-30 transition-colors shrink-0"
          >
            添加
          </button>
        </div>

        {/* AI 出牌 */}
        <IntentInput onSubmit={handleIntent} disabled={loading} />
      </div>
    </div>
  );
}
