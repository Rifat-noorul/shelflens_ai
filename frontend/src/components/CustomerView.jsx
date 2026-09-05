import React, { useState } from 'react';
import { Search, Camera, Sparkles, MapPin, CheckCircle, XCircle, ShoppingBag, ArrowRight, SlidersHorizontal, RefreshCw } from 'lucide-react';
import VisualSearchModal from './VisualSearchModal';
import StoreMapModal from './StoreMapModal';
import { INITIAL_BAZAAR_ITEMS } from '../data/mockItems';

const CATEGORIES = [
  "All Items",
  "Salem Silk & Textiles",
  "Fashion Jewellery & Ornaments",
  "Traditional Cosmetics & Beauty",
  "Spices & Organic Groceries",
  "Handicrafts & Decor",
  "Leather & Footwear"
];

export default function CustomerView({ items = [], onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [visualSearchResults, setVisualSearchResults] = useState(null);
  const [visualSearchQueryUrl, setVisualSearchQueryUrl] = useState(null);
  const [selectedMapItem, setSelectedMapItem] = useState(null);

  // Combine fetched backend items with default Salem Bazaar catalog if backend has few items
  const displayItems = visualSearchResults 
    ? visualSearchResults 
    : (items && items.length > 0 ? items : INITIAL_BAZAAR_ITEMS);

  // Filter logic
  const filteredItems = displayItems.filter(item => {
    const matchCat = selectedCategory === 'All Items' || item.category === selectedCategory;
    const matchSearch = searchQuery === '' || 
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.shop_name && item.shop_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handleSearchResults = (results, queryUrl) => {
    setVisualSearchResults(results);
    setVisualSearchQueryUrl(queryUrl);
  };

  const clearVisualSearch = () => {
    setVisualSearchResults(null);
    setVisualSearchQueryUrl(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Hero Search Section */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-zinc-900 to-zinc-950 p-6 md:p-8 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Crimson Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="max-w-3xl space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-semibold border border-red-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Salem Bazaar Retail Discovery
          </span>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Discover Traditional Retail Inventory in <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-red-600">Real-Time</span>
          </h2>
          
          <p className="text-sm text-slate-300">
            Snap any product photo or shade to instantly locate exact shelf positions, stock availability, and turn-by-turn shop navigation across Salem Bazaar.
          </p>

          {/* Search Inputs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            
            {/* Text Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Salem sarees, jewellery, spices, soaps..."
                className="w-full pl-10 pr-4 py-3 bg-zinc-950/90 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
              />
            </div>

            {/* Visual Search Button */}
            <button
              onClick={() => setIsVisualSearchOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs shadow-lg shadow-red-600/20 active:scale-95 transition-all whitespace-nowrap"
            >
              <Camera className="w-4 h-4" />
              <span>Visual Search: Snap & Find</span>
            </button>

          </div>
        </div>
      </div>

      {/* Visual Search Banner Active */}
      {visualSearchResults && (
        <div className="glass-panel p-4 rounded-xl border border-red-500/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {visualSearchQueryUrl && (
              <img src={visualSearchQueryUrl} alt="Query" className="w-12 h-12 object-cover rounded-lg border border-red-500/40" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-600 dark:text-red-500 uppercase tracking-wider">Visual Search Active</span>
                <span className="text-[10px] bg-red-500/20 text-red-500 dark:text-red-400 px-2 py-0.5 rounded-full font-mono">
                  {visualSearchResults.length} Matches Found
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-300">Showing ranked visual similarity matches via CLIP ViT-B/32 vector embeddings</p>
            </div>
          </div>
          <button
            onClick={clearVisualSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-red-600 transition-colors"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20'
                : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Results Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Displaying <span className="font-bold text-slate-900 dark:text-white">{filteredItems.length}</span> Salem Bazaar items
          </p>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1 text-xs text-red-600 dark:text-red-500 hover:underline font-semibold"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh Inventory
          </button>
        </div>

        {filteredItems.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-400 dark:text-zinc-600 mx-auto" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-zinc-300">No items match your query</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-500 max-w-sm mx-auto">
              Try adjusting your search terms or use the camera button to upload a shelf item photo.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 flex flex-col group transition-all duration-300 hover:-translate-y-1 hover:border-red-500/40"
              >
                {/* Thumbnail Image Container */}
                <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=600&q=80";
                    }}
                  />
                  
                  {/* Category Pill Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-zinc-950/80 text-red-400 border border-red-500/30 backdrop-blur-md">
                      {item.category}
                    </span>
                  </div>

                  {/* Stock Availability Badge */}
                  <div className="absolute top-3 right-3">
                    {item.is_available ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                        <CheckCircle className="w-3 h-3" /> In Stock
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-400 border border-rose-500/30 backdrop-blur-md">
                        <XCircle className="w-3 h-3" /> Sold Out
                      </span>
                    )}
                  </div>

                  {/* Visual Similarity Badge */}
                  {item.similarity !== undefined && (
                    <div className="absolute bottom-3 right-3">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-600 text-white shadow-md">
                        {Math.round(item.similarity * 100)}% Visual Match
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Content Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {item.shop_name || "Salem Bazaar Merchant Shelf"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-red-600 dark:text-red-500 shrink-0" />
                      {item.shop_location || "Bazaar Main Rack A-2, Salem"}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <button
                      onClick={() => setSelectedMapItem(item)}
                      className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-semibold border border-slate-200 dark:border-zinc-800 transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />
                      Hold Item
                    </button>
                    
                    <button
                      onClick={() => setSelectedMapItem(item)}
                      className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all"
                    >
                      <span>Navigate</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visual Search Modal */}
      <VisualSearchModal
        isOpen={isVisualSearchOpen}
        onClose={() => setIsVisualSearchOpen(false)}
        onSearchResults={handleSearchResults}
      />

      {/* Store Location Map Modal */}
      <StoreMapModal
        item={selectedMapItem}
        isOpen={!!selectedMapItem}
        onClose={() => setSelectedMapItem(null)}
      />

    </div>
  );
}
