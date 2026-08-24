import { useState, useEffect } from 'react';
import { storefrontApi } from '@global/services/api/appApis';

export interface Category {
  id: string | number;
  name: string;
  nameDisplay?: string;
  image: string;
  bgColor: string;
  accentColor: string;
}

const LEGACY_CATEGORIES = [
  { id: 1, name: "Fresh Fruits", image: "/fruits.webp", bgColor: "#FFF3E0", accentColor: "#F57C00" },
  { id: 2, name: "Bread and Biscuits", image: "/bread.webp", bgColor: "#F3E5F5", accentColor: "#8E24AA" },
  { id: 3, name: "Sweet Tooth", image: "/sweet.webp", bgColor: "#E8F5E9", accentColor: "#43A047" },
  { id: 4, name: "Bath and Body", image: "/bathbody.jpg", bgColor: "#E3F2FD", accentColor: "#1E88E5" },
  { id: 5, name: "Beverages", image: "/beverages.webp", bgColor: "#FCE4EC", accentColor: "#E91E63" },
  { id: 6, name: "Kitchen Essentials", image: "/kitchen.webp", bgColor: "#F1F8E9", accentColor: "#7CB342" },
  { id: 7, name: "Munchies", image: "/munchies.webp", bgColor: "#FFF8E1", accentColor: "#FFB300" },
  { id: 8, name: "Packed Food", image: "/packaged.webp", bgColor: "#E0F7FA", accentColor: "#00ACC1" },
  { id: 9, name: "Chocolates", image: "/chocolates.webp", bgColor: "#FBE9E7", accentColor: "#E64A19" },
  { id: 10, name: "Fresh Vegetables", image: "/vegetables.webp", bgColor: "#E8F5E9", accentColor: "#2E7D32" },
  { id: 11, name: "Cleaning Essentials", image: "/clean.webp", bgColor: "#EDE7F6", accentColor: "#512DA8" },
  { id: 12, name: "Stationery", image: "/stationary.webp", bgColor: "#FFF9C4", accentColor: "#F9A825" },
  { id: 13, name: "Pet Supplies", image: "/pet_food.webp", bgColor: "#FFECB3", accentColor: "#FF6F00" },
  { id: 14, name: "Dairy", nameDisplay: "Dairy & Eggs", image: "/dairy.webp", bgColor: "#E8F5E9", accentColor: "#2E7D32" },
  { id: 15, name: "Frozen Food", image: "/deserts.webp", bgColor: "#FFF3E0", accentColor: "#F57C00" },
  { id: 16, name: "Pharmacy", image: "/pharmacy.webp", bgColor: "#E3F2FD", accentColor: "#1E88E5" },
  { id: 17, name: "Breakfast & Cereals", image: "/breakfast.webp", bgColor: "#FCE4EC", accentColor: "#E91E63" },
  { id: 18, name: "Home Care", image: "/decore.webp", bgColor: "#F1F8E9", accentColor: "#7CB342" },
  { id: 19, name: "Men's Clothing", image: "https://cdn-icons-png.flaticon.com/512/3050/3050229.png", bgColor: "#E3F2FD", accentColor: "#1E88E5" },
  { id: 20, name: "Women's Clothing", image: "https://cdn-icons-png.flaticon.com/512/3050/3050244.png", bgColor: "#FCE4EC", accentColor: "#E91E63" },
  { id: 21, name: "Electronics", image: "https://cdn-icons-png.flaticon.com/512/2777/2777142.png", bgColor: "#E3F2FD", accentColor: "#1E88E5" },
  { id: 22, name: "Jewelery", nameDisplay: "Jewelry", image: "https://cdn-icons-png.flaticon.com/512/3081/3081648.png", bgColor: "#E3F2FD", accentColor: "#1E88E5" },
  { id: 23, name: "Beauty", image: "https://cdn-icons-png.flaticon.com/512/3120/3120531.png", bgColor: "#FCE4EC", accentColor: "#E91E63" },
  { id: 24, name: "Fragrances", image: "https://cdn-icons-png.flaticon.com/512/3120/3120616.png", bgColor: "#F3E5F5", accentColor: "#8E24AA" },
  { id: 25, name: "Furniture", image: "https://cdn-icons-png.flaticon.com/512/2635/2635445.png", bgColor: "#EFEBE9", accentColor: "#6D4C41" },
  { id: 26, name: "Meat", image: "https://cdn-icons-png.flaticon.com/512/1046/1046774.png", bgColor: "#FFEBEE", accentColor: "#C62828" },
  { id: 27, name: "Seafood", image: "https://cdn-icons-png.flaticon.com/512/2347/2347311.png", bgColor: "#E0F7FA", accentColor: "#00838F" }
];

const FALLBACK_COLORS = [
  { bgColor: "#FFF3E0", accentColor: "#F57C00" },
  { bgColor: "#F3E5F5", accentColor: "#8E24AA" },
  { bgColor: "#E8F5E9", accentColor: "#43A047" },
  { bgColor: "#E3F2FD", accentColor: "#1E88E5" },
  { bgColor: "#FCE4EC", accentColor: "#E91E63" },
  { bgColor: "#F1F8E9", accentColor: "#7CB342" },
  { bgColor: "#FFF8E1", accentColor: "#FFB300" },
  { bgColor: "#E0F7FA", accentColor: "#00ACC1" },
];

const stringToHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    try {
      const unsubscribe = storefrontApi.subscribeToCategories((data) => {
        const enriched = data.map(cat => {
          // Find if it matches a legacy category by name or ID (case-insensitive)
          const legacy = LEGACY_CATEGORIES.find(l => 
            String(l.id) === String(cat.id) || 
            l.name.toLowerCase() === cat.name.toLowerCase()
          );

          if (legacy) {
            return {
              ...legacy,
              id: cat.id, // Preserve the new Firebase ID
              name: cat.name,
              nameDisplay: legacy.nameDisplay || cat.name
            } as Category;
          }

          // Generate deterministic colors for new categories
          const hash = stringToHash(cat.name);
          const colorPair = FALLBACK_COLORS[hash % FALLBACK_COLORS.length];

          return {
            id: cat.id,
            name: cat.name,
            nameDisplay: cat.name,
            image: "https://placehold.co/100x100/e8fbf3/10b981?text=" + encodeURIComponent(cat.name.substring(0, 3).toUpperCase()),
            bgColor: colorPair.bgColor,
            accentColor: colorPair.accentColor
          } as Category;
        });

        setCategories(enriched);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      setIsError(true);
      setIsLoading(false);
    }
  }, []);

  return { categories, isLoading, isError };
};
