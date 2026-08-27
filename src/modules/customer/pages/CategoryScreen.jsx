import React, { useState, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router";
import { useCategories } from "../hooks/useCategories";
import { useProducts } from "../hooks/useProducts";
import { matchCategory } from "@global/models/Categories";
import { Search, Sparkles, ChevronRight, Grid } from "lucide-react";

export const CategoryScreen = React.memo(({ onCategoryClick }) => {
  const context = useOutletContext() || {};
  const { categories: hookCategories = [] } = useCategories();
  const { products = [] } = useProducts();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState("All");

  // Merge context categories with hook categories
  const allCategories = useMemo(() => {
    const list = context.categories && context.categories.length > 0 ? context.categories : hookCategories;
    return list;
  }, [context.categories, hookCategories]);

  // Compute product count per category
  const categoryCounts = useMemo(() => {
    const counts = {};
    allCategories.forEach(cat => {
      const matchCount = products.filter(p => matchCategory(p.itemCategory, cat.name)).length;
      counts[cat.name] = matchCount > 0 ? `${matchCount} items` : "Explore items";
    });
    return counts;
  }, [allCategories, products]);

  // Distinct sections list
  const sections = useMemo(() => {
    const set = new Set(["All"]);
    allCategories.forEach(c => {
      if (c.section) set.add(c.section);
    });
    return Array.from(set);
  }, [allCategories]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return allCategories.filter(cat => {
      const matchesSearch = !searchQuery.trim() || 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (cat.nameDisplay && cat.nameDisplay.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSection = selectedSection === "All" || cat.section === selectedSection;
      return matchesSearch && matchesSection;
    });
  }, [allCategories, searchQuery, selectedSection]);

  // Group filtered categories by section
  const groupedCategories = useMemo(() => {
    if (selectedSection !== "All" || searchQuery.trim()) {
      return [{ title: selectedSection === "All" ? "Search Results" : selectedSection, items: filteredCategories }];
    }

    const groups = [];
    const sectionOrder = [
      "Fresh Produce & Dairy",
      "Bakery, Snacks & Beverages",
      "Home, Hygiene & Cleaning",
      "Lifestyle, Fashion & Electronics",
      "Other Categories"
    ];

    sectionOrder.forEach(secName => {
      const items = allCategories.filter(c => (c.section || "Other Categories") === secName);
      if (items.length > 0) {
        groups.push({ title: secName, items });
      }
    });

    return groups;
  }, [allCategories, filteredCategories, selectedSection, searchQuery]);

  const handleSelect = (category) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    } else {
      navigate(`/categories/${encodeURIComponent(category.name)}`);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10 pb-32 select-none min-h-screen text-left animate-fade-in gap-8">
      
      {/* ── Header Section ── */}
      <div className="pt-2 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-surface-variant/40 dark:border-[#262626] pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles size={16} />
            <span>Complete Grocery & Store Catalog</span>
          </div>
          <h1 className="font-display-lg text-on-surface dark:text-white text-3xl sm:text-4xl font-black tracking-tight">
            All Categories Directory
          </h1>
          <p className="font-body-lg text-on-surface-variant mt-1.5 text-xs sm:text-sm max-w-2xl">
            Browse all {allCategories.length} categories available across fresh produce, pantry, dairy, household, and lifestyle essentials.
          </p>
        </div>

        {/* Live Search inside Categories */}
        <div className="w-full md:w-72 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter categories..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low dark:bg-[#171717] border border-surface-variant/40 dark:border-[#262626] rounded-xl text-xs font-bold text-on-surface dark:text-white focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-slate-text/70 shadow-inner"
          />
        </div>
      </div>

      {/* ── Section Pills Bar ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {sections.map(sec => {
          const isSelected = selectedSection === sec;
          const count = sec === "All" ? allCategories.length : allCategories.filter(c => c.section === sec).length;
          return (
            <button
              key={sec}
              onClick={() => {
                setSelectedSection(sec);
                setSearchQuery("");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? "bg-primary text-on-primary shadow-md"
                  : "bg-surface-container-low dark:bg-[#171717] text-on-surface dark:text-white border border-surface-variant/40 dark:border-[#262626] hover:bg-surface-container dark:hover:bg-[#201f1f]"
              }`}
            >
              <span>{sec}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${isSelected ? 'bg-black/20 text-white' : 'bg-surface-variant/40 dark:bg-[#262626] text-on-surface-variant'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Directory Sections Grid ── */}
      <div className="flex flex-col gap-10">
        {groupedCategories.map((group, idx) => (
          <section key={idx} className="flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-surface-variant/30 dark:border-[#262626] pb-2">
              <h2 className="font-headline-md text-on-surface dark:text-white text-lg sm:text-xl font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span>{group.title}</span>
              </h2>
              <span className="text-xs text-on-surface-variant font-bold">
                {group.items.length} categories
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {group.items.map((cat) => (
                <button
                  key={cat.id || cat.name}
                  onClick={() => handleSelect(cat)}
                  className="group relative overflow-hidden rounded-2xl bg-surface-container-low dark:bg-[#171717] shadow-xs hover:shadow-lg transition-all duration-300 border border-surface-variant/40 dark:border-[#262626] hover:border-primary/60 dark:hover:border-primary/60 flex flex-col justify-between h-40 p-4 text-left cursor-pointer"
                >
                  {/* Category Top details */}
                  <div className="flex justify-between items-start z-10 relative">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-primary/15 dark:bg-primary/20 text-primary flex items-center justify-center shadow-xs">
                        <span className="material-symbols-outlined text-[20px]">{cat.icon || "category"}</span>
                      </div>
                      <div>
                        <span className="font-headline-md text-on-surface dark:text-white text-sm sm:text-base font-bold leading-tight block">
                          {cat.nameDisplay || cat.name}
                        </span>
                        <span className="text-[11px] text-on-surface-variant font-medium block mt-0.5">
                          {categoryCounts[cat.name] || "Explore"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action / Subtitle */}
                  <div className="z-10 relative flex justify-between items-center mt-auto pt-2">
                    <span className="text-[11px] font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Shop Now</span>
                      <ChevronRight size={14} />
                    </span>
                  </div>

                  {/* Category Image Overlay in Bottom Corner */}
                  <div className="absolute -bottom-4 -right-4 w-28 h-28 opacity-85 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300 ease-out z-0 pointer-events-none">
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-contain object-bottom right-0 absolute"
                      onError={(e) => { e.target.src = "https://placehold.co/100x100/e8fbf3/10b981?text=" + encodeURIComponent(cat.name.substring(0, 3)); }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}

        {groupedCategories.length === 0 && (
          <div className="text-center py-20 bg-surface-container-low/40 dark:bg-[#171717]/40 rounded-3xl border border-dashed border-surface-variant/50 dark:border-[#262626]">
            <span className="material-symbols-outlined text-4xl text-slate-text">category</span>
            <p className="font-headline-md text-base font-bold text-on-surface dark:text-white mt-2">No matching categories found</p>
            <p className="text-xs text-on-surface-variant mt-1">Try searching for a different item or clear the filter.</p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedSection("All"); }}
              className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

CategoryScreen.displayName = "CategoryScreen";


