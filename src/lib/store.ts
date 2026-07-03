import { create } from 'zustand';

interface CampusStore {
  activeSection: string;
  setActiveSection: (section: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  voiceOpen: boolean;
  setVoiceOpen: (open: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  dashboardData: any;
  setDashboardData: (data: any) => void;
  chatMessages: { role: string; content: string; agentType?: string }[];
  addChatMessage: (msg: { role: string; content: string; agentType?: string }) => void;
  clearChatMessages: () => void;
  chatLoading: boolean;
  setChatLoading: (loading: boolean) => void;
  selectedAgent: string;
  setSelectedAgent: (agent: string) => void;
  notifVersion: number;
  bumpNotifVersion: () => void;
}

export const useCampusStore = create<CampusStore>((set) => ({
  activeSection: 'dashboard',
  setActiveSection: (section) => set({ activeSection: section }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  chatOpen: false,
  setChatOpen: (open) => set({ chatOpen: open }),
  voiceOpen: false,
  setVoiceOpen: (open) => set({ voiceOpen: open }),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  accentColor: 'purple',
  setAccentColor: (color) => set({ accentColor: color }),
  dashboardData: null,
  setDashboardData: (data) => set({ dashboardData: data }),
  chatMessages: [],
  addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  clearChatMessages: () => set({ chatMessages: [] }),
  chatLoading: false,
  setChatLoading: (loading) => set({ chatLoading: loading }),
  selectedAgent: 'master',
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
  notifVersion: 0,
  bumpNotifVersion: () => set((state) => ({ notifVersion: state.notifVersion + 1 })),
}));

const API_PORT = '8001';

export async function fetchAPI(endpoint: string) {
  // Next.js API routes proxy to Python FastAPI backend
  const res = await fetch(`/api${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function postAPI(endpoint: string, data: any) {
  const res = await fetch(`/api${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function patchAPI(endpoint: string, data: any) {
  const res = await fetch(`/api${endpoint}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function deleteAPI(endpoint: string) {
  const res = await fetch(`/api${endpoint}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
