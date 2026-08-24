import React from "react";
import { useOutletContext } from "react-router";

export const CategoryScreen = React.memo(({ onCategoryClick }) => {
  const { categories = [] } = useOutletContext();
  return (
    <div className="flex flex-col pb-28 select-none w-full max-w-7xl mx-auto min-h-screen bg-transparent animate-fade-in">
      {/* Header Banner */}
      <div className="w-full bg-gradient-to-r from-primary-500 to-primary-650 p-8 shadow-sm rounded-3xl mt-2 text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <h2 className="text-3xl font-black text-white tracking-tight">All Categories</h2>
        <p className="text-sm text-white/80 mt-1.5 font-bold">Discover our handpicked fresh daily items</p>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-5 py-8">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onCategoryClick(cat)}
            className="flex flex-col bg-white dark:bg-[#111724] border border-slate-100 dark:border-slate-800 rounded-3xl p-4 items-center justify-between text-left group transition-all duration-300 hover:shadow-md dark:hover:shadow-none hover:border-primary-100/50 active:scale-95 aspect-auto min-h-[135px] sm:min-h-[155px] cursor-pointer"
            style={{ backgroundColor: `${cat.bgColor}15` }}
          >
            <div className="w-16 h-16 bg-white dark:bg-[#0c101a] rounded-2xl flex items-center justify-center shadow-sm border border-slate-100/50 dark:border-slate-800/40 group-hover:scale-105 transition-transform duration-300">
              <img 
                src={cat.image} 
                alt={cat.nameDisplay || cat.name} 
                className="w-12 h-12 object-contain"
                onError={(e) => { e.target.src = "https://placehold.co/48x48/e8fbf3/10b981?text=Cat"; }}
              />
            </div>

            {/* Title & Action Label */}
            <div className="flex flex-col items-center mt-3 w-full">
              <span className="text-xs font-black text-slate-850 dark:text-slate-200 text-center leading-tight line-clamp-2 min-h-[32px]">
                {cat.nameDisplay || cat.name}
              </span>
              <span 
                className="mt-2 px-3 py-1 text-[10px] font-black rounded-full select-none"
                style={{ 
                  backgroundColor: `${cat.accentColor}1A`, 
                  color: cat.accentColor 
                }}
              >
                Shop Now →
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

CategoryScreen.displayName = "CategoryScreen";
