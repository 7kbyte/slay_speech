import { useState } from 'react';
import { useAppStore } from '../store/useStore';
import type { Card } from '../types';

export default function CardsPage() {
  const { cards, setCards } = useAppStore();
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [newCard, setNewCard] = useState({ name: '', image: '', localPath: '' });
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editCard, setEditCard] = useState({ name: '', image: '', localPath: '' });

  const filtered = cards.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newCard.name.trim()) return;
    setCards([
      ...cards,
      {
        id: -1,
        enName: '',
        name: newCard.name.trim(),
        image: newCard.image.trim(),
        localPath: newCard.localPath.trim(),
      },
    ]);
    setNewCard({ name: '', image: '', localPath: '' });
    setAdding(false);
  };

  const handleEdit = (idx: number) => {
    setEditCard({ ...cards[idx] });
    setEditingIdx(idx);
  };

  const handleSaveEdit = () => {
    if (editingIdx === null || !editCard.name.trim()) return;
    const updated = [...cards];
    updated[editingIdx] = {
      ...cards[editingIdx],
      name: editCard.name.trim(),
      image: editCard.image.trim(),
      localPath: editCard.localPath.trim(),
    };
    setCards(updated);
    setEditingIdx(null);
  };

  const handleDelete = (idx: number) => {
    if (window.confirm(`确定删除卡牌「${cards[idx].name}」？`)) {
      setCards(cards.filter((_, i) => i !== idx));
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(cards, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cards.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const imported: Card[] = JSON.parse(text);
        if (!Array.isArray(imported)) throw new Error('格式错误');
        if (window.confirm(`导入 ${imported.length} 张卡牌，替换当前牌库？`)) {
          setCards(imported);
        }
      } catch {
        alert('文件格式错误，请导入有效的 cards.json');
      }
    };
    input.click();
  };

  const handleReset = () => {
    if (window.confirm('确定重置为默认牌库吗？')) {
      localStorage.removeItem('slay-cards');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* 头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100">牌库管理</h2>
          <p className="text-[11px] sm:text-sm text-zinc-500 mt-0.5">共 {cards.length} 张卡牌</p>
        </div>
        <div className="flex gap-1.5 sm:gap-2 flex-wrap">
          <button
            onClick={handleImport}
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition-colors"
          >
            导入
          </button>
          <button
            onClick={handleExport}
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition-colors"
          >
            导出
          </button>
          <button
            onClick={handleReset}
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-lg bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 dark:text-red-400 transition-colors"
          >
            重置
          </button>
          <button
            onClick={() => setAdding(true)}
            className="px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-lg bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/30 transition-colors font-medium"
          >
            + 添加卡牌
          </button>
        </div>
      </div>

      {/* 搜索 */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="搜索卡牌..."
        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 mb-3 sm:mb-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 text-[13px] sm:text-sm text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
      />

      {/* 添加新卡牌 */}
      {adding && (
        <div className="mb-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/50 space-y-2">
          <input
            type="text"
            value={newCard.name}
            onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
            placeholder="卡牌名称 *"
            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 border border-zinc-200 dark:border-zinc-700/30 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!newCard.name.trim()}
              className="px-4 py-1.5 text-xs rounded-lg bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/30 disabled:opacity-30 transition-colors"
            >
              确认
            </button>
            <button
              onClick={() => {
                setAdding(false);
                setNewCard({ name: '', image: '', localPath: '' });
              }}
              className="px-4 py-1.5 text-xs rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 卡牌列表 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {filtered.map((card) => {
          const originalIndex = cards.indexOf(card);
          if (editingIdx === originalIndex) {
            return (
              <div
                key={`${card.name}-${originalIndex}`}
                className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-amber-300 dark:border-amber-500/30 space-y-2"
              >
                <input
                  type="text"
                  value={editCard.name}
                  onChange={(e) => setEditCard({ ...editCard, name: e.target.value })}
                  className="w-full px-2 py-1 rounded bg-white dark:bg-zinc-700 text-sm text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600 focus:outline-none"
                  placeholder="名称"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                />
                <div className="flex gap-1">
                  <button
                    onClick={handleSaveEdit}
                    className="px-2 py-1 text-[11px] rounded bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/30"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingIdx(null)}
                    className="px-2 py-1 text-[11px] rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                  >
                    取消
                  </button>
                </div>
              </div>
            );
          }
          return (
            <div
              key={`${card.name}-${originalIndex}`}
              className="group p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{card.name}</span>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(originalIndex)}
                    className="w-5 h-5 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-[10px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                    title="编辑"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(originalIndex)}
                    className="w-5 h-5 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-red-100 dark:hover:bg-red-500/40 text-[10px] text-zinc-500 hover:text-red-500 dark:hover:text-red-300 transition-colors"
                    title="删除"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center py-12 text-sm text-zinc-400 dark:text-zinc-600">
          {search ? '没有匹配的卡牌' : '牌库为空'}
        </p>
      )}
    </div>
  );
}
