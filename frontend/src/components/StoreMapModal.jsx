import React, { useState } from 'react';
import { MapPin, Navigation, Phone, Clock, CheckCircle, X, Store, ShoppingBag } from 'lucide-react';

export default function StoreMapModal({ item, isOpen, onClose }) {
  const [holdConfirmed, setHoldConfirmed] = useState(false);

  if (!isOpen || !item) return null;

  const handleHold = () => {
    setHoldConfirmed(true);
    setTimeout(() => {
      setHoldConfirmed(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-red-500/30 p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 dark:text-zinc-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-500">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Hyper-Local Store Navigation</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Salem Bazaar Retail Rack Locator</p>
          </div>
        </div>

        {/* Item Summary Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 mb-5">
          <img src={item.image_url} alt={item.category} className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-zinc-700" />
          <div className="flex-1">
            <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
              {item.category}
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{item.shop_name || "Salem Bazaar General Store"}</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
              <Navigation className="w-3 h-3 text-red-600 dark:text-red-500" />
              {item.shop_location || "Main Bazaar Rack A-2, Salem"}
            </p>
          </div>
          {item.price && (
            <div className="text-right">
              <span className="text-sm font-bold text-emerald-500">{item.price}</span>
            </div>
          )}
        </div>

        {/* Interactive Salem Bazaar Map Schematic */}
        <div className="mb-5 p-4 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-3">
            <span className="font-semibold text-slate-800 dark:text-zinc-200">Floor Layout & Rack Location</span>
            <span className="text-[10px] text-emerald-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live Shelf Sensor Active
            </span>
          </div>

          <div className="h-44 w-full bg-slate-50 dark:bg-zinc-900/90 rounded-lg p-3 relative flex flex-col justify-between border border-slate-200 dark:border-zinc-800">
            {/* Entrance */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-500 border-b border-slate-200 dark:border-zinc-800 pb-1">
              <span>📍 Main Entrance (Bazaar Street)</span>
              <span>Cashier Desk</span>
            </div>

            {/* Simulated Racks Grid */}
            <div className="grid grid-cols-3 gap-2 my-auto">
              <div className="p-2 rounded bg-slate-200/50 dark:bg-zinc-800/50 border border-slate-300 dark:border-zinc-700/50 text-[10px] text-slate-600 dark:text-zinc-400 text-center">
                Aisle 1: Textiles
              </div>
              <div className="p-2 rounded bg-red-500/10 border-2 border-red-600 text-red-600 dark:text-red-400 font-bold text-[10px] text-center shadow-lg shadow-red-600/10 animate-pulse">
                🎯 Target Rack (Item Found)
              </div>
              <div className="p-2 rounded bg-slate-200/50 dark:bg-zinc-800/50 border border-slate-300 dark:border-zinc-700/50 text-[10px] text-slate-600 dark:text-zinc-400 text-center">
                Aisle 3: Spices
              </div>
            </div>

            {/* Footer Location Details */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-200 dark:border-zinc-800">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-red-600 dark:text-red-500" /> Open: 9:00 AM - 9:30 PM</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-red-600 dark:text-red-500" /> +91 427 245 9800</span>
            </div>
          </div>
        </div>

        {holdConfirmed ? (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-center text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Item Held for 30 minutes! Show confirmation at Salem Bazaar counter.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleHold}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-white text-xs font-semibold border border-slate-200 dark:border-zinc-700 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-red-600 dark:text-red-500" />
              Hold 30 Min in Store
            </button>
            <a
              href="https://maps.google.com/?q=Salem+Bazaar+Tamil+Nadu"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white text-xs font-bold shadow-lg shadow-red-600/20 active:scale-95 transition-all"
            >
              <Navigation className="w-4 h-4" />
              Start GPS Turn-by-Turn
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
