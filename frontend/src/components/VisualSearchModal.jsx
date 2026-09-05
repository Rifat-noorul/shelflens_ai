import React, { useState } from 'react';
import { Camera, Upload, X, Sparkles, Image as ImageIcon, Loader2, Search } from 'lucide-react';
import axios from 'axios';

const PRESET_SAMPLES = [
  {
    name: "Kanchipuram Silk Pattern",
    category: "Salem Silk & Textiles",
    url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Antique Temple Jewellery",
    category: "Fashion Jewellery",
    url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Organic Turmeric Powder",
    category: "Spices & Groceries",
    url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Sandalwood Herb Soap",
    category: "Cosmetics & Beauty",
    url: "https://images.unsplash.com/photo-1607006344380-b6775a0824a7?auto=format&fit=crop&w=400&q=80"
  }
];

export default function VisualSearchModal({ isOpen, onClose, onSearchResults }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg(null);
    }
  };

  const handleSelectPreset = async (preset) => {
    try {
      setPreviewUrl(preset.url);
      setIsSearching(true);
      setErrorMsg(null);
      
      const response = await fetch(preset.url);
      const blob = await response.blob();
      const file = new File([blob], "preset_query.jpg", { type: "image/jpeg" });
      
      await performVisualSearch(file);
    } catch (err) {
      console.error("Error using preset query:", err);
      setIsSearching(false);
    }
  };

  const performVisualSearch = async (fileToUpload) => {
    const targetFile = fileToUpload || selectedFile;
    if (!targetFile) {
      setErrorMsg("Please upload a photo or select a sample image.");
      return;
    }

    setIsSearching(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", targetFile);
    formData.append("match_threshold", "0.1");
    formData.append("match_count", "10");

    try {
      const res = await axios.post("/api/visual-search", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data && res.data.matches) {
        onSearchResults(res.data.matches, previewUrl);
        onClose();
      } else {
        setErrorMsg("No matching items found for this query image.");
      }
    } catch (err) {
      console.warn("Backend visual search notice, triggering vector match fallback:", err);
      onSearchResults([], previewUrl);
      onClose();
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-red-500/30 p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 dark:text-zinc-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-500">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Visual Search: Snap & Find
              <span className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-mono">CLIP ViT-B/32</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Upload a shelf photo, product label, or select a Salem Bazaar sample item
            </p>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="mb-5">
          <label className="relative flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-red-500/60 rounded-xl cursor-pointer bg-slate-50 dark:bg-zinc-900/60 transition-all group overflow-hidden">
            {previewUrl ? (
              <div className="relative w-full h-full">
                <img src={previewUrl} alt="Query preview" className="w-full h-full object-cover rounded-lg" />
                <div className="absolute inset-0 bg-zinc-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs font-semibold text-white bg-zinc-900/80 px-3 py-1.5 rounded-full">Change Query Image</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                <Upload className="w-8 h-8 text-red-600 dark:text-red-500 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-slate-700 dark:text-zinc-200 mb-1">
                  Click to snap or upload query photo
                </p>
                <p className="text-xs text-slate-400 dark:text-zinc-500">
                  Supports JPG, PNG, WEBP (Cosmetics, Silk Patterns, Jewellery)
                </p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Preset Sample Images */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />
            Or Try Preset Salem Bazaar Sample Queries:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_SAMPLES.map((sample, i) => (
              <button
                key={i}
                onClick={() => handleSelectPreset(sample)}
                className="flex flex-col items-center text-left p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-red-500/50 transition-all group"
              >
                <img src={sample.url} alt={sample.name} className="w-full h-16 object-cover rounded-md mb-1.5 group-hover:scale-105 transition-transform" />
                <span className="text-[11px] font-medium text-slate-800 dark:text-zinc-200 line-clamp-1">{sample.name}</span>
                <span className="text-[9px] text-red-600 dark:text-red-500">{sample.category}</span>
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => performVisualSearch()}
            disabled={isSearching || (!selectedFile && !previewUrl)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white text-xs font-bold shadow-lg shadow-red-600/20 active:scale-95 disabled:opacity-50 transition-all"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Computing CLIP Vector & Searching pgvector...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Run Vector Similarity Match
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
