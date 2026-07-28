import { useState } from 'react';
import { useAppStore } from '../store/useStore';

export default function SettingsPage() {
  const { settings, updateSettings } = useAppStore();
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [endpoint, setEndpoint] = useState(settings.apiEndpoint);
  const [model, setModel] = useState(settings.model);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings({ apiKey, apiEndpoint: endpoint, model });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">设置</h2>
      <p className="text-[11px] sm:text-sm text-zinc-500 mb-4 sm:mb-6">配置 API 连接信息，数据仅保存在浏览器本地</p>

      <div className="space-y-4 sm:space-y-5">
        {/* API Key */}
        <div>
          <label className="block text-[11px] sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1 sm:mb-1.5">
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 text-[13px] sm:text-sm text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/50 transition-colors"
          />
          <p className="text-[10px] sm:text-[11px] text-zinc-400 dark:text-zinc-600 mt-1 sm:mt-1.5">
            在{' '}
            <a
              href="https://platform.deepseek.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 underline"
            >
              platform.deepseek.com
            </a>{' '}
            获取 API Key，只保存在浏览器 localStorage 中
          </p>
        </div>

        {/* Endpoint */}
        <div>
          <label className="block text-[11px] sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1 sm:mb-1.5">
            API 端点
          </label>
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 text-[13px] sm:text-sm text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {/* Model */}
        <div>
          <label className="block text-[11px] sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1 sm:mb-1.5">
            模型
          </label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 text-[13px] sm:text-sm text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/50 transition-colors"
          />
          <p className="text-[10px] sm:text-[11px] text-zinc-400 dark:text-zinc-600 mt-1 sm:mt-1.5">
            默认 deepseek-v4-flash（极速响应），也可用 deepseek-v4-pro（更强推理）
          </p>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full py-2 sm:py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[13px] sm:text-sm font-medium transition-colors"
        >
          {saved ? '✓ 已保存' : '保存设置'}
        </button>
      </div>

      {/* 使用说明 */}
      <div className="mt-8 sm:mt-10 p-4 sm:p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-[11px] sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1.5 sm:mb-2">使用说明</h3>
        <ol className="text-[10px] sm:text-xs text-zinc-500 space-y-1 sm:space-y-1.5 list-decimal list-inside leading-relaxed">
          <li>先在设置页面填入你的 DeepSeek API Key</li>
          <li>在对话页面手动添加对话消息（或加载示例），构建对话上下文</li>
          <li>在底部输入框输入你想表达的意思，点击"出牌"</li>
          <li>AI 会从牌库中选择最合适的 3 张卡牌，你可以选择一张打出</li>
          <li>可以随时编辑、删除、插入对话消息</li>
          <li>在牌库页面可以管理卡牌（增删改、导入导出）</li>
        </ol>
      </div>
    </div>
  );
}
