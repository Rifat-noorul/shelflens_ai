import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import CustomerView from './components/CustomerView';
import MerchantPortal from './components/MerchantPortal';
import AuthModal from './components/AuthModal';
import { INITIAL_BAZAAR_ITEMS } from './data/mockItems';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [activeView, setActiveView] = useState('customer'); // 'customer' | 'merchant'
  const [items, setItems] = useState(INITIAL_BAZAAR_ITEMS);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  // Dark / Light Theme State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('shelflens_theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Auth State
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('shopper'); // 'shopper' | 'merchant'
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Sync theme class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('shelflens_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('shelflens_theme', 'light');
    }
  }, [darkMode]);

  // Sync Supabase Auth Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setUserRole(session.user.user_metadata?.role || 'merchant');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setUserRole(session.user.user_metadata?.role || 'merchant');
      } else {
        setUser(null);
        setUserRole('shopper');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get('/api/items', { timeout: 3000 });
      if (res.data && res.data.items) {
        setItems(res.data.items.length > 0 ? res.data.items : INITIAL_BAZAAR_ITEMS);
        setIsBackendOnline(true);
      }
    } catch (err) {
      console.log('Running in local dynamic fallback mode:', err.message);
      setIsBackendOnline(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAuthSuccess = (authUser, role) => {
    setUser(authUser);
    setUserRole(role);
    if (role === 'merchant') {
      setActiveView('merchant');
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out notice:", err);
    }
    setUser(null);
    setUserRole('shopper');
    setActiveView('customer');
  };

  const handleOpenAuth = (defaultRole = 'merchant') => {
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col transition-colors duration-200 selection:bg-red-600 selection:text-white">
      
      {/* App Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        itemsCount={items.length}
        isBackendOnline={isBackendOnline}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={user}
        userRole={userRole}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeView === 'customer' ? (
          <CustomerView items={items} onRefresh={fetchItems} />
        ) : (
          <MerchantPortal
            items={items}
            onItemsUpdated={fetchItems}
            user={user}
            userRole={userRole}
            onOpenAuth={handleOpenAuth}
          />
        )}
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-200 dark:border-zinc-800/80 py-6 px-4 text-center text-xs text-slate-500 dark:text-zinc-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 ShelfLens AI — Salem Bazaar Retail Case Study System</p>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 dark:text-zinc-400">
            <span>FastAPI</span> • <span>Ultralytics YOLOv8</span> • <span>OpenAI CLIP</span> • <span>Supabase pgvector</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
