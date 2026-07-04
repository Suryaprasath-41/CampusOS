import { create } from 'zustand';

export interface ToastItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

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
  activeRole: 'student' | 'faculty' | 'admin';
  setActiveRole: (role: 'student' | 'faculty' | 'admin') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toasts: ToastItem[];
  addToast: (toast: ToastItem) => void;
  removeToast: (id: string) => void;
  chatContext: string;
  setChatContext: (ctx: string) => void;
  openChatWithContext: (context: string) => void;
  // Auth state
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;
  logout: () => void;
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
  activeRole: 'student',
  setActiveRole: (role) => set({ activeRole: role, activeSection: 'dashboard' }),
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  toasts: [],
  addToast: (toast) => set((state) => ({ toasts: [...state.toasts.slice(-4), toast] })), // Keep max 5 toasts
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  chatContext: '',
  setChatContext: (ctx) => set({ chatContext: ctx }),
  openChatWithContext: (context) => {
    set((state) => {
      const agent = state.selectedAgent;
      return {
        chatOpen: true,
        chatContext: '',
        chatMessages: [...state.chatMessages, { role: 'user', content: context, agentType: agent }],
        chatLoading: true,
      };
    });
    // Fire-and-forget API call; update store on response
    const state = useCampusStore.getState();
    const agent = state.selectedAgent;
    postAPI('/chat', { message: context, agentType: agent })
      .then((data) => {
        useCampusStore.setState((s) => ({
          chatMessages: [...s.chatMessages, { role: 'assistant', content: data.response, agentType: data.agentType }],
          chatLoading: false,
        }));
      })
      .catch(() => {
        useCampusStore.setState((s) => ({
          chatMessages: [...s.chatMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', agentType: agent }],
          chatLoading: false,
        }));
      });
  },
  // Auth state
  isAuthenticated: false,
  setIsAuthenticated: (val) => set({ isAuthenticated: val }),
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  logout: () => set({
    isAuthenticated: false,
    currentUser: null,
    activeRole: 'student' as const,
    activeSection: 'dashboard',
    dashboardData: null,
    chatMessages: [],
    chatLoading: false,
    sidebarOpen: true,
  }),
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
