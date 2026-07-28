import { useState, useCallback, useEffect, useRef } from 'react';
import type { Message, Card, AppSettings } from '../types';
import { loadCards, saveCards } from '../services/cards';
import { getSettings, getSettingsSync, saveSettings } from '../services/api';

// 简单的全局状态管理 hook
let globalMessages: Message[] = [];
let globalCards: Card[] = [];
let globalSettings: AppSettings = getSettingsSync();
let listeners: (() => void)[] = [];

function notifyListeners() {
  listeners.forEach((l) => l());
}

export function useAppStore() {
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick((t) => t + 1), []);

  const cardsLoadedRef = useRef(false);
  const settingsLoadedRef = useRef(false);

  useEffect(() => {
    const listener = () => forceUpdate();
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, [forceUpdate]);

  useEffect(() => {
    if (!cardsLoadedRef.current) {
      cardsLoadedRef.current = true;
      loadCards().then((c) => {
        globalCards = c;
        notifyListeners();
      });
    }
  }, []);

  useEffect(() => {
    if (!settingsLoadedRef.current) {
      settingsLoadedRef.current = true;
      getSettings().then((s) => {
        globalSettings = s;
        notifyListeners();
      });
    }
  }, []);

  const messages = globalMessages;
  const cards = globalCards;
  const settings = globalSettings;

  const setMessages = useCallback((msgs: Message[]) => {
    globalMessages = msgs;
    notifyListeners();
  }, []);

  const addMessage = useCallback((msg: Message) => {
    globalMessages = [...globalMessages, msg];
    notifyListeners();
  }, []);

  const updateMessage = useCallback((id: string, content: string) => {
    globalMessages = globalMessages.map((m) =>
      m.id === id ? { ...m, content } : m
    );
    notifyListeners();
  }, []);

  const deleteMessage = useCallback((id: string) => {
    globalMessages = globalMessages.filter((m) => m.id !== id);
    notifyListeners();
  }, []);

  const insertMessage = useCallback((index: number, msg: Message) => {
    const newMsgs = [...globalMessages];
    newMsgs.splice(index, 0, msg);
    globalMessages = newMsgs;
    notifyListeners();
  }, []);

  const setCards = useCallback((c: Card[]) => {
    globalCards = c;
    saveCards(c);
    notifyListeners();
  }, []);

  const updateSettings = useCallback((s: AppSettings) => {
    globalSettings = s;
    saveSettings(s);
    notifyListeners();
  }, []);

  return {
    messages,
    cards,
    settings,
    setMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    insertMessage,
    setCards,
    updateSettings,
  };
}
