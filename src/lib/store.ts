import { create } from 'zustand';

interface CampusStore {
  activeSection: string;
  setActiveSection: (section: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  dashboardData: any;
  setDashboardData: (data: any) => void;
  chatMessages: { role: string; content: string; agentType?: string }[];
  addChatMessage: (msg: { role: string; content: string; agentType?: string }) => void;
  chatLoading: boolean;
  setChatLoading: (loading: boolean) => void;
  selectedAgent: string;
  setSelectedAgent: (agent: string) => void;
}

export const useCampusStore = create<CampusStore>((set) => ({
  activeSection: 'dashboard',
  setActiveSection: (section) => set({ activeSection: section }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  chatOpen: false,
  setChatOpen: (open) => set({ chatOpen: open }),
  dashboardData: null,
  setDashboardData: (data) => set({ dashboardData: data }),
  chatMessages: [],
  addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  chatLoading: false,
  setChatLoading: (loading) => set({ chatLoading: loading }),
  selectedAgent: 'master',
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
}));

export async function fetchAPI(endpoint: string) {
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
