import type { AIResponse, AppSettings, Card, CardChoice } from '../types';

const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  apiEndpoint: 'https://api.deepseek.com/chat/completions',
  model: 'deepseek-v4-flash',
};

// 读取 api.config.json 的缓存
let _configCache: Partial<AppSettings> | null = null;

async function loadApiConfig(): Promise<Partial<AppSettings>> {
  if (_configCache) return _configCache;
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}api.config.json`);
    if (res.ok) {
      _configCache = await res.json();
      return _configCache ?? {};
    }
  } catch {
    // 文件不存在或读取失败
  }
  _configCache = {};
  return {};
}

export async function getSettings(): Promise<AppSettings> {
  // 优先级: api.config.json > localStorage > 默认值
  const fileConfig = await loadApiConfig();

  const stored = localStorage.getItem('slay-settings');
  let localConfig: Partial<AppSettings> = {};
  if (stored) {
    try {
      localConfig = JSON.parse(stored);
      // 自动升级旧端点格式
      if (localConfig.apiEndpoint?.includes('/v1/')) {
        localConfig.apiEndpoint = DEFAULT_SETTINGS.apiEndpoint;
      }
      // 自动升级旧模型名
      if (localConfig.model === 'deepseek-chat' || localConfig.model === 'deepseek-reasoner') {
        localConfig.model = DEFAULT_SETTINGS.model;
      }
    } catch {
      // ignore
    }
  }

  // 优先级: 设置页面 (localStorage) > api.config.json > 默认值
  return { ...DEFAULT_SETTINGS, ...fileConfig, ...localConfig };
}

export function getSettingsSync(): AppSettings {
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem('slay-settings', JSON.stringify(settings));
}

// 读取 prompt.config.json 的缓存
let _promptConfigCache: { systemPrompt?: string; userPromptTemplate?: string } | null = null;

async function loadPromptConfig() {
  if (_promptConfigCache) return _promptConfigCache;
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}prompt.config.json`);
    if (res.ok) {
      _promptConfigCache = await res.json();
      return _promptConfigCache ?? {};
    }
  } catch {
    // 文件不存在或读取失败
  }
  _promptConfigCache = {};
  return {};
}

function buildCardList(cards: Card[]): string {
  return cards
    .map((c) => `[${String(c.id).padStart(3, '0')}_${c.enName}] ${c.name}`)
    .join('\n');
}

function buildSystemPrompt(cards: Card[]): string {
  const cardList = buildCardList(cards);

  return `你是杀戮尖塔风格的对话辅助助手。

任务：根据一段对话上下文和用户想表达的意思，从下方卡牌列表中选择最合适的 3 张卡牌。

规则：
1. 只能从列表中选择，绝对不能编造或推荐不存在的卡牌编号。
2. 选择标准：卡牌名称和描述的语义最贴近用户想表达的情绪、态度或意图。
3. 返回 Top 3，按匹配度从高到低排序。
4. 每张卡牌附带一句简短理由（≤15字），说明为什么选这张。

输出格式（严格遵循）：
[编号_英文名] 简短理由 | [编号_英文名] 简短理由 | [编号_英文名] 简短理由

输出样例：
[042_Strike] 直接回击指责 | [018_Rage] 表达心中愤怒 | [075_Defend] 回避冲突退让

卡牌列表（共 ${cards.length} 张）：
${cardList}`;
}

/**
 * 从模型输出中提取卡牌编号和理由
 * 输入格式: [042_Strike] 直接回击指责 | [018_Rage] 表达心中愤怒 | [075_Defend] 回避冲突退让
 */
export function parseCardOutput(raw: string, cards: Card[]): CardChoice[] {
  const results: CardChoice[] = [];

  // 策略 1: 新格式正则 [编号_英文名] 理由 | ...
  const regex = /\[(\d{3})_(\w+)\]\s*(.+?)(?=\s*\|\s*(?:\[|$)|$)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(raw)) !== null) {
    const cardId = parseInt(match[1], 10);
    const enName = match[2];
    const reason = match[3].trim().replace(/\s*$/, '');

    const card = cards[cardId];
    if (card && card.enName === enName) {
      results.push({ name: card.name, reason, cardId, enName });
    }
    if (results.length >= 3) break;
  }

  // 策略 2: 旧格式 JSON fallback
  if (results.length === 0) {
    try {
      // 尝试提取 JSON
      let jsonStr = raw.trim();
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonStr = jsonMatch[1].trim();

      const parsed = JSON.parse(jsonStr);
      if (parsed.cards && Array.isArray(parsed.cards)) {
        for (const c of parsed.cards) {
          const card = cards.find(card => card.name === c.name);
          if (card) {
            results.push({ name: card.name, reason: c.reason || '', cardId: card.id, enName: card.enName });
          }
        }
      }
    } catch {
      // JSON 解析失败，继续下面的策略
    }
  }

  // 策略 3: 宽松匹配 [编号_英文名]（只要编号，不要理由）
  if (results.length === 0) {
    const looseRegex = /\[(\d{3})_(\w+)\]/g;
    let looseMatch: RegExpExecArray | null;
    while ((looseMatch = looseRegex.exec(raw)) !== null) {
      const cardId = parseInt(looseMatch[1], 10);
      const enName = looseMatch[2];
      const card = cards[cardId];
      if (card && card.enName === enName) {
        results.push({ name: card.name, reason: '', cardId, enName });
      }
    }
  }

  return results.slice(0, 3);
}

export async function selectCards(
  conversation: { role: string; content: string }[],
  intent: string,
  cards: Card[]
): Promise<AIResponse> {
  const settings = await getSettings();

  // 检查 API Key 是否有效：不为空且不是占位符
  const invalidKeys = ['your-deepseek-api-key-here', 'sk-your-api-key'];
  const isInvalidKey = !settings.apiKey || invalidKeys.includes(settings.apiKey);
  if (isInvalidKey) {
    throw new Error('请先在「设置」页面填入你的 DeepSeek API Key');
  }

  const promptConfig = await loadPromptConfig();
  let systemPrompt = promptConfig.systemPrompt;

  // 如果 prompt.config.json 有自定义模板，替换占位符
  if (systemPrompt && (systemPrompt.includes('{{cardCount}}') || systemPrompt.includes('{{cardList}}'))) {
    systemPrompt = systemPrompt
      .replace('{{cardCount}}', String(cards.length))
      .replace('{{cardList}}', buildCardList(cards));
  }

  // 如果模板为空或不存在，用内置的 buildSystemPrompt
  if (!systemPrompt) {
    systemPrompt = buildSystemPrompt(cards);
  }

  // 构建对话上下文
  const contextStr = conversation
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n');

  const userTemplate = promptConfig.userPromptTemplate || '对话上下文：\n{{context}}\n\n我想表达的意思：{{intent}}\n\n请从卡牌列表中选择最合适的 3 张卡牌。';
  const userMessage = userTemplate
    .replace('{{context}}', contextStr)
    .replace('{{intent}}', intent);

  const requestBody = {
    model: settings.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 2048,
  };

  // 调试输出：完整请求
  console.group('🔍 [Slay Debug] 发送给 LLM 的请求');
  console.log('📍 端点:', settings.apiEndpoint);
  console.log('🤖 模型:', settings.model);
  console.log('📝 完整请求体 (JSON):');
  console.log(JSON.stringify(requestBody, null, 2));
  console.log('📊 Token 估算:');
  console.log('  - system prompt:', systemPrompt.length, '字符');
  console.log('  - user message:', userMessage.length, '字符');
  console.log('  - 总计:', systemPrompt.length + userMessage.length, '字符');
  console.groupEnd();

  const response = await fetch(settings.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('❌ [Slay Debug] API 请求失败:', response.status, err);
    throw new Error(`API 请求失败: ${response.status} ${err}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || '';

  // 调试输出：完整响应
  console.group('✅ [Slay Debug] LLM 返回响应');
  console.log('📬 原始完整响应 (JSON):');
  console.log(JSON.stringify(data, null, 2));
  console.log('💬 提取的消息内容:');
  console.log(rawContent);
  console.groupEnd();

  // 用正则提取卡牌编号和理由（新格式）
  console.group('🔧 [Slay Debug] 解析卡牌选择');
  console.log('📝 原始文本:', rawContent.trim());

  const choices = parseCardOutput(rawContent, cards);
  console.log('🎴 解析结果:', choices);

  if (choices.length === 0) {
    console.error('❌ 未提取到有效卡牌编号，原始文本:', rawContent.slice(0, 300));
    throw new Error('AI 未返回有效的卡牌选择，请重试');
  }
  console.groupEnd();

  return { cards: choices };
}
