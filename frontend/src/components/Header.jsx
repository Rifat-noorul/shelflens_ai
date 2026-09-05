import React from 'react';
import { Store, Camera, LayoutGrid, Sun, Moon, LogIn, LogOut, UserCheck, Shield } from 'lucide-react';

export default function Header({
  activeView,
  setActiveView,
  itemsCount,
  isBackendOnline,
  darkMode,
  setDarkMode,
  user,
  userRole,
  onOpenAuth,
  onSignOut
}) {
  const handleMerchantTabClick = () => {
    if (!user || userRole !== 'merchant') {
      onOpenAuth('merchant');
    } else {
      setActiveView('merchant');
    }
  };

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-200 dark:border-zinc-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-400 p-0.5 shadow-lg shadow-red-600/20">
            <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Store className="w-5 h-5 text-red-600 dark:text-red-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                ShelfLens <span className="text-red-600 dark:text-red-500 font-extrabold">AI</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                Salem Bazaar
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Hyper-Local AI Inventory & Visual Discovery System
            </p>
          </div>
        </div>

        {/* Action Controls: Theme Switcher, Navigation, Auth */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          
          {/* Backend Status Dot */}
          <div className="hidden md:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300">
            <span className={`w-2 h-2 rounded-full ${isBackendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span>{isBackendOnline ? 'AI Backend Online' : 'Local Dynamic Mode'}</span>
          </div>

          {/* Theme Toggle Button (Sun / Moon) */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-500 transition-colors"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Navigation Pill Switcher */}
          <div className="bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center gap-1">
            <button
              onClick={() => setActiveView('customer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'customer'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Customer Discovery</span>
            </button>

            <button
              onClick={handleMerchantTabClick}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'merchant'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Merchant Portal</span>
              {itemsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-slate-200 dark:bg-zinc-950/60 font-bold">
                  {itemsCount}
                </span>
              )}
            </button>
          </div>

          {/* Auth Button / Profile Badge */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
                <UserCheck className="w-3.5 h-3.5" />
                <span className="max-w-[100px] truncate">{user.email?.split('@')[0] || user.phone || 'Merchant'}</span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-red-600 text-white font-bold">
                  {userRole}
                </span>
              </div>
              <button
                onClick={onSignOut}
                className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-red-500 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('merchant')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold shadow-md shadow-red-600/20 active:scale-95 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
