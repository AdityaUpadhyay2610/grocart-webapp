import { useState, useEffect } from 'react';
import { storefrontApi } from '@global/services/api/appApis';

export interface Category {
  id: string | number;
  name: string;
  nameDisplay?: string;
  image: string;
  bgColor: string;
  accentColor: string;
  icon?: string;
  section?: string;
}

export const LEGACY_CATEGORIES: Category[] = [
  { id: 1, name: "Fresh Fruits", nameDisplay: "Fresh Fruits", image: "/fruits.webp", bgColor: "#FFF3E0", accentColor: "#F57C00", icon: "nutrition", section: "Fresh Produce & Dairy" },
  { id: 10, name: "Fresh Vegetables", nameDisplay: "Fresh Vegetables", image: "/vegetables.webp", bgColor: "#E8F5E9", accentColor: "#2E7D32", icon: "grass", section: "Fresh Produce & Dairy" },
  { id: 14, name: "Dairy", nameDisplay: "Dairy & Eggs", image: "/dairy.webp", bgColor: "#E8F5E9", accentColor: "#2E7D32", icon: "water_drop", section: "Fresh Produce & Dairy" },
  { id: 26, name: "Meat", nameDisplay: "Fresh Meat & Poultry", image: "https://cdn-icons-png.flaticon.com/512/1046/1046774.png", bgColor: "#FFEBEE", accentColor: "#C62828", icon: "restaurant", section: "Fresh Produce & Dairy" },
  { id: 27, name: "Seafood", nameDisplay: "Fresh Seafood & Fish", image: "https://cdn-icons-png.flaticon.com/512/2347/2347311.png", bgColor: "#E0F7FA", accentColor: "#00838F", icon: "set_meal", section: "Fresh Produce & Dairy" },

  { id: 2, name: "Bread and Biscuits", nameDisplay: "Bread & Biscuits", image: "/bread.webp", bgColor: "#F3E5F5", accentColor: "#8E24AA", icon: "bakery_dining", section: "Bakery, Snacks & Beverages" },
  { id: 5, name: "Beverages", nameDisplay: "Beverages & Drinks", image: "/beverages.webp", bgColor: "#FCE4EC", accentColor: "#E91E63", icon: "local_cafe", section: "Bakery, Snacks & Beverages" },
  { id: 7, name: "Munchies", nameDisplay: "Munchies & Snacks", image: "/munchies.webp", bgColor: "#FFF8E1", accentColor: "#FFB300", icon: "cookie", section: "Bakery, Snacks & Beverages" },
  { id: 8, name: "Packed Food", nameDisplay: "Packaged & Instant Food", image: "/packaged.webp", bgColor: "#E0F7FA", accentColor: "#00ACC1", icon: "inventory_2", section: "Bakery, Snacks & Beverages" },
  { id: 9, name: "Chocolates", nameDisplay: "Chocolates & Candies", image: "/chocolates.webp", bgColor: "#FBE9E7", accentColor: "#E64A19", icon: "cookie", section: "Bakery, Snacks & Beverages" },
  { id: 3, name: "Sweet Tooth", nameDisplay: "Sweets & Desserts", image: "/sweet.webp", bgColor: "#E8F5E9", accentColor: "#43A047", icon: "cake", section: "Bakery, Snacks & Beverages" },
  { id: 15, name: "Frozen Food", nameDisplay: "Frozen Food & Ice Cream", image: "/deserts.webp", bgColor: "#FFF3E0", accentColor: "#F57C00", icon: "ac_unit", section: "Bakery, Snacks & Beverages" },
  { id: 17, name: "Breakfast & Cereals", nameDisplay: "Breakfast & Cereals", image: "/breakfast.webp", bgColor: "#FCE4EC", accentColor: "#E91E63", icon: "breakfast_dining", section: "Bakery, Snacks & Beverages" },

  { id: 6, name: "Kitchen Essentials", nameDisplay: "Kitchen & Cooking Essentials", image: "/kitchen.webp", bgColor: "#F1F8E9", accentColor: "#7CB342", icon: "kitchen", section: "Home, Hygiene & Cleaning" },
  { id: 11, name: "Cleaning Essentials", nameDisplay: "Cleaning Essentials", image: "/clean.webp", bgColor: "#EDE7F6", accentColor: "#512DA8", icon: "cleaning_services", section: "Home, Hygiene & Cleaning" },
  { id: 18, name: "Home Care", nameDisplay: "Home Care & Decor", image: "/decore.webp", bgColor: "#F1F8E9", accentColor: "#7CB342", icon: "home", section: "Home, Hygiene & Cleaning" },
  { id: 4, name: "Bath and Body", nameDisplay: "Bath & Body Care", image: "/bathbody.jpg", bgColor: "#E3F2FD", accentColor: "#1E88E5", icon: "soap", section: "Home, Hygiene & Cleaning" },
  { id: 16, name: "Pharmacy", nameDisplay: "Pharmacy & Wellness", image: "/pharmacy.webp", bgColor: "#E3F2FD", accentColor: "#1E88E5", icon: "medication", section: "Home, Hygiene & Cleaning" },
  { id: 12, name: "Stationery", nameDisplay: "Stationery & Office", image: "/stationary.webp", bgColor: "#FFF9C4", accentColor: "#F9A825", icon: "edit", section: "Home, Hygiene & Cleaning" },
  { id: 13, name: "Pet Supplies", nameDisplay: "Pet Supplies & Food", image: "/pet_food.webp", bgColor: "#FFECB3", accentColor: "#FF6F00", icon: "pets", section: "Home, Hygiene & Cleaning" },

  { id: 23, name: "Beauty", nameDisplay: "Beauty & Cosmetics", image: "https://cdn-icons-png.flaticon.com/512/3120/3120531.png", bgColor: "#FCE4EC", accentColor: "#E91E63", icon: "spa", section: "Lifestyle, Fashion & Electronics" },
  { id: 24, name: "Fragrances", nameDisplay: "Fragrances & Perfumes", image: "https://cdn-icons-png.flaticon.com/512/3120/3120616.png", bgColor: "#F3E5F5", accentColor: "#8E24AA", icon: "air", section: "Lifestyle, Fashion & Electronics" },
  { id: 19, name: "Men's Clothing", nameDisplay: "Men's Clothing & Fashion", image: "https://cdn-icons-png.flaticon.com/512/3050/3050229.png", bgColor: "#E3F2FD", accentColor: "#1E88E5", icon: "checkroom", section: "Lifestyle, Fashion & Electronics" },
  { id: 20, name: "Women's Clothing", nameDisplay: "Women's Clothing & Fashion", image: "https://cdn-icons-png.flaticon.com/512/3050/3050244.png", bgColor: "#FCE4EC", accentColor: "#E91E63", icon: "styler", section: "Lifestyle, Fashion & Electronics" },
  { id: 21, name: "Electronics", nameDisplay: "Electronics & Gadgets", image: "https://cdn-icons-png.flaticon.com/512/2777/2777142.png", bgColor: "#E3F2FD", accentColor: "#1E88E5", icon: "devices", section: "Lifestyle, Fashion & Electronics" },
  { id: 22, name: "Jewelery", nameDisplay: "Jewelry & Accessories", image: "https://cdn-icons-png.flaticon.com/512/3081/3081648.png", bgColor: "#E3F2FD", accentColor: "#1E88E5", icon: "diamond", section: "Lifestyle, Fashion & Electronics" },
  { id: 25, name: "Furniture", nameDisplay: "Home Furniture", image: "https://cdn-icons-png.flaticon.com/512/2635/2635445.png", bgColor: "#EFEBE9", accentColor: "#6D4C41", icon: "chair", section: "Lifestyle, Fashion & Electronics" }
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
  const [categories, setCategories] = useState<Category[]>(LEGACY_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    try {
      const unsubscribe = storefrontApi.subscribeToCategories((data) => {
        // Build map with legacy categories first as base
        const categoryMap = new Map<string, Category>();
        
        LEGACY_CATEGORIES.forEach(cat => {
          categoryMap.set(cat.name.toLowerCase(), { ...cat });
        });

        // Merge/update with any live categories from Firebase
        if (data && data.length > 0) {
          data.forEach(cat => {
            const key = cat.name.toLowerCase();
            const existing = categoryMap.get(key);
            if (existing) {
              categoryMap.set(key, {
                ...existing,
                id: cat.id,
                name: cat.name,
                nameDisplay: existing.nameDisplay || cat.name
              });
            } else {
              const hash = stringToHash(cat.name);
              const colorPair = FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
              categoryMap.set(key, {
                id: cat.id,
                name: cat.name,
                nameDisplay: cat.name,
                image: "https://placehold.co/100x100/e8fbf3/10b981?text=" + encodeURIComponent(cat.name.substring(0, 3).toUpperCase()),
                bgColor: colorPair.bgColor,
                accentColor: colorPair.accentColor,
                icon: "category",
                section: "Other Categories"
              });
            }
          });
        }

        setCategories(Array.from(categoryMap.values()));
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn("Categories subscription error, using legacy list", e);
      setCategories(LEGACY_CATEGORIES);
      setIsError(true);
      setIsLoading(false);
    }
  }, []);

  return { categories, isLoading, isError };
};

