// 卡牌数据类型
export interface Card {
  name: string;
  image: string;
  localPath: string;
  id: number;
  enName: string;
}

// 对话消息
export interface Message {
  id: string;
  role: 'user' | 'other';
  content: string;
  cardName?: string; // 如果这条消息是通过卡牌发出的，记录卡牌名
}

// AI 选牌结果
export interface CardChoice {
  name: string;
  reason: string;
  cardId: number;
  enName: string;
}

export interface AIResponse {
  cards: CardChoice[];
}

// 对话会话
export interface ConversationSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// 应用设置
export interface AppSettings {
  apiKey: string;
  apiEndpoint: string;
  model: string;
}
