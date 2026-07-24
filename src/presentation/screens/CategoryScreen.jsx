import React from "react";
import { CATEGORIES } from "../../domain/models/Categories";

export const CategoryScreen = React.memo(({ onCategoryClick }) => {
  return (
    <div className="flex flex-col pb-28 select-none w-full max-w-7xl mx-auto min-h-screen bg-transparent">
      {/* Header Banner */}
      <div className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 p-8 shadow-md rounded-3xl mt-2 text-left">
        <h2 className="text-3xl font-black text-white tracking-tight">All Categories</h2>
        <p className="text-sm text-white/80 mt-1.5">What are you looking for today?</p>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-5 py-8">
        {CATEGORIES.map(cat => (
          <button
            key={cat.name}
            onClick={() => onCategoryClick(cat)}
            className="flex flex-col bg-white dark:bg-[#111724] border border-gray-100 dark:border-slate-800 rounded-3xl p-4 items-center justify-between text-left group transition-all duration-300 hover:shadow-md dark:hover:shadow-none hover:border-cyan-100/50 active:scale-95 aspect-[0.9]"
            style={{ backgroundColor: `${cat.bgColor}40` }} // 25% opacity version of background
          >
            {/* Image box */}
            <div className="w-16 h-16 bg-white dark:bg-[#151C2C] rounded-2xl flex items-center justify-center shadow-sm border border-gray-50/50 dark:border-slate-800/60 group-hover:scale-105 transition-transform duration-300">
              <img 
                src={cat.image} 
                alt={cat.nameDisplay || cat.name} 
                className="w-12 h-12 object-contain"
                onError={(e) => { e.target.src = "https://placehold.co/48x48/f1f5f9/7c3aed?text=Cat"; }}
              />
            </div>

            {/* Title & Action Label */}
            <div className="flex flex-col items-center mt-3 w-full">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 text-center leading-tight line-clamp-2 min-h-[32px]">
                {cat.nameDisplay || cat.name}
              </span>
              <span 
                className="mt-2 px-3 py-1 text-[10px] font-black rounded-full select-none"
                style={{ 
                  backgroundColor: `${cat.accentColor}1A`, 
                  color: cat.accentColor 
                }}
              >
                Shop →
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

CategoryScreen.displayName = "CategoryScreen";


