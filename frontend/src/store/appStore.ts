import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, 
  Round, 
  PriceData, 
  NotificationMessage, 
  Theme,
  Transaction 
} from '../types';
import { STORAGE_KEYS } from '../config/constants';

interface AppState {
  // UI State
  sidebarOpen: boolean;
  theme: Theme;
  
  // User State
  user: User | null;
  isAuthenticated: boolean;
  
  // Market State
  currentRound: Round | null;
  priceData: PriceData | null;
  
  // Notifications
  notifications: NotificationMessage[];
  
  // Transactions
  pendingTransactions: Transaction[];
  
  // Loading States
  isLoading: {
    user: boolean;
    round: boolean;
    price: boolean;
    predictions: boolean;
  };
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setCurrentRound: (round: Round | null) => void;
  setPriceData: (price: PriceData | null) => void;
  addNotification: (notification: Omit<NotificationMessage, 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (hash: string, updates: Partial<Transaction>) => void;
  removeTransaction: (hash: string) => void;
  setLoading: (key: keyof AppState['isLoading'], loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  sidebarOpen: false,
  theme: 'dark' as Theme,
  user: null,
  isAuthenticated: false,
  currentRound: null,
  priceData: null,
  notifications: [],
  pendingTransactions: [],
  isLoading: {
    user: false,
    round: false,
    price: false,
    predictions: false,
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      setTheme: (theme) => {
        set({ theme });
        // Update document class for Tailwind dark mode
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      
      setUser: (user) => set({ user }),
      
      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
      
      setCurrentRound: (round) => set({ currentRound: round }),
      
      setPriceData: (price) => set({ priceData: price }),
      
      addNotification: (notification) => {
        const newNotification: NotificationMessage = {
          ...notification,
          id: Date.now().toString(),
          timestamp: Date.now(),
          read: false,
        };
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep only 50 notifications
        }));
      },
      
      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },
      
      clearNotifications: () => set({ notifications: [] }),
      
      addTransaction: (transaction) => {
        set((state) => ({
          pendingTransactions: [transaction, ...state.pendingTransactions],
        }));
      },
      
      updateTransaction: (hash, updates) => {
        set((state) => ({
          pendingTransactions: state.pendingTransactions.map((tx) =>
            tx.hash === hash ? { ...tx, ...updates } : tx
          ),
        }));
      },
      
      removeTransaction: (hash) => {
        set((state) => ({
          pendingTransactions: state.pendingTransactions.filter((tx) => tx.hash !== hash),
        }));
      },
      
      setLoading: (key, loading) => {
        set((state) => ({
          isLoading: {
            ...state.isLoading,
            [key]: loading,
          },
        }));
      },
      
      reset: () => set(initialState),
    }),
    {
      name: STORAGE_KEYS.USER_PREFERENCES,
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

// Initialize theme on app start
const { theme } = useAppStore.getState();
if (theme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}
