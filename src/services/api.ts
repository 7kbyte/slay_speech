import type { AIResponse, AppSettings, Card } from '../types';
import { getCardNames } from './cards';

const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  apiEndpoint: 'https://api.deepseek.com/chat/completions',
  model: 'deepseek-v4-flash',
};

// 读取 api.config.json 的缓存
let _configCache: Partial<AppSettings> | null = null;
let _configLoaded = false;

async function loadApiConfig(): Promise<Partial<AppSettings>> {
  if (_configLoaded) return _configCache ?? {};
  _configLoaded = true;
  try {
    const res = await fetch('/api.config.json');
    if (res.ok) {
      _configCache = await res.json();
      return _configCache ?? {};
    }
  } catch {
    // 文件不存在或读取失败
  }
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

  return { ...DEFAULT_SETTINGS, ...localConfig, ...fileConfig };
}

export function getSettingsSync(): AppSettings {
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem('slay-settings', JSON.stringify(settings));
}

// 读取 prompt.config.json 的缓存
let _promptConfigCache: { systemPrompt?: string; userPromptTemplate?: string } | null = null;
let _promptConfigLoaded = false;

async function loadPromptConfig() {
  if (_promptConfigLoaded) return _promptConfigCache ?? {};
  _promptConfigLoaded = true;
  try {
    const res = await fetch('/prompt.config.json');
    if (res.ok) {
      _promptConfigCache = await res.json();
      return _promptConfigCache ?? {};
    }
  } catch {
    // 文件不存在或读取失败
  }
  return {};
}

function buildSystemPrompt(cards: Card[], promptConfig: { systemPrompt?: string }): string {
  const names = getCardNames(cards);
  const nameList = names.join('、');

  const template = promptConfig.systemPrompt || '';
  // 如果配置了自定义模板则使用，否则使用默认的硬编码后备
  return template
    ? template.replace('{{cardCount}}', String(cards.length)).replace('{{cardNames}}', nameList)
    : `你是杀戮尖塔风格的对话辅助助手。你的任务是：根据一段对话上下文和用户想要表达的意思，从给定的卡牌名称列表中选择最合适的 3 张卡牌。\n\n规则：\n1. 只能从卡牌列表中选择，绝对不能编造或推荐列表之外的卡牌。\n2. 选择标准：卡牌名称的语义最贴近用户想表达的情绪、态度或意图。卡牌名称本身即是表达方式（如"愤怒"代表愤怒的情绪，"防御"代表防守姿态，"打击"代表直接攻击性回应）。\n3. 返回 Top 3 最合适的卡牌，按匹配度从高到低排序。\n4. 每张卡牌附带简短的一句理由（为什么选这张）。\n\n可用的卡牌名称列表（共 ${cards.length} 张）：\n${nameList}\n\n你必须严格按照以下 JSON 格式返回，不要包含任何其他文字：\n{"cards":[{"name":"卡牌名","reason":"选择理由"}],"thinking":"你的简短分析"}`;
}

export async function selectCards(
  conversation: { role: string; content: string }[],
  intent: string,
  cards: Card[]
): Promise<AIResponse> {
  const settings = await getSettings();

  if (!settings.apiKey) {
    throw new Error('请先在设置中配置 API Key');
  }

  const promptConfig = await loadPromptConfig();
  const systemPrompt = buildSystemPrompt(cards, promptConfig);

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
    max_tokens: 1024,
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

  // 解析 JSON 响应
  try {
    // 尝试提取 JSON（可能被 markdown 代码块包裹）
    let jsonStr = rawContent.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    const result: AIResponse = JSON.parse(jsonStr);

    // 验证卡牌名是否在牌库中
    const cardNameSet = new Set(cards.map((c) => c.name));
    result.cards = result.cards.filter((c) => cardNameSet.has(c.name));

    if (result.cards.length === 0) {
      throw new Error('AI 未返回有效的卡牌选择');
    }

    return result;
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error(`AI 返回格式错误: ${rawContent.slice(0, 200)}`);
    }
    throw e;
  }
}
