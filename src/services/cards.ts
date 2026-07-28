import type { Card } from '../types';

const STORAGE_KEY = 'slay-cards';
const DEFAULT_CARDS_URL = `${import.meta.env.BASE_URL}data/cards.json`;

// 从 localStorage 获取自定义卡牌，如果没有则从默认文件加载
export async function loadCards(): Promise<Card[]> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // 解析失败，从默认文件加载
    }
  }
  const res = await fetch(DEFAULT_CARDS_URL);
  const cards: Card[] = await res.json();
  saveCards(cards);
  return cards;
}

export function saveCards(cards: Card[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function getCardsSync(): Card[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

// 获取所有卡牌名称列表
export function getCardNames(cards: Card[]): string[] {
  return cards.map((c) => c.name);
}

// 根据卡牌名获取图片 URL（优先在线 URL，fallback 到本地路径）
export function getCardImageUrl(cards: Card[], name: string): string | undefined {
  const card = cards.find((c) => c.name === name);
  if (!card) return undefined;
  return card.image || card.localPath || undefined;
}
