export const CATEGORIES = [
  { id: 1, name: "Fresh Fruits", image: "/fruits.webp", bgColor: "#FFF3E0", accentColor: "#F57C00" },
  { id: 2, name: "Bread and Biscuits", image: "/bread.webp", bgColor: "#F3E5F5", accentColor: "#8E24AA" },
  { id: 3, name: "Sweet Tooth", image: "/sweet.webp", bgColor: "#E8F5E9", accentColor: "#43A047" },
  { id: 4, name: "Bath and Body", image: "/bathbody.jpg", bgColor: "#E3F2FD", accentColor: "#1E88E5" },
  { id: 5, name: "Beverages", image: "/beverages.webp", bgColor: "#FCE4EC", accentColor: "#E91E63" },
  { id: 6, name: "Kitchen Essentials", image: "/kitchen.webp", bgColor: "#F1F8E9", accentColor: "#7CB342" },
  { id: 7, name: "Munchies", image: "/munchies.webp", bgColor: "#FFF8E1", accentColor: "#FFB300" },
  { id: 8, name: "Packed Food", image: "/packaged.webp", bgColor: "#E0F7FA", accentColor: "#00ACC1" },
  { id: 9, name: "choclates\n", nameDisplay: "Chocolates", image: "/chocolates.webp", bgColor: "#FBE9E7", accentColor: "#E64A19" },
  { id: 10, name: "Fresh Vegetables", image: "/vegetables.webp", bgColor: "#E8F5E9", accentColor: "#2E7D32" },
  { id: 11, name: "Cleaning Essentials", image: "/clean.webp", bgColor: "#EDE7F6", accentColor: "#512DA8" },
  { id: 12, name: "Stationery", image: "/stationary.webp", bgColor: "#FFF9C4", accentColor: "#F9A825" },
  { id: 13, name: "Pet Food", image: "/pet_food.webp", bgColor: "#FFECB3", accentColor: "#FFFF6F00" },
  { id: 14, name: "dairy\n", nameDisplay: "Dairy & Eggs", image: "/dairy.webp", bgColor: "#E8F5E9", accentColor: "#2E7D32" },
  { id: 15, name: "Frozen Food", image: "/deserts.webp", bgColor: "#FFF3E0", accentColor: "#F57C00" },
  { id: 16, name: "Pharmacy", image: "/pharmacy.webp", bgColor: "#E3F2FD", accentColor: "#1E88E5" },
  { id: 17, name: "Breakfast & Cereals", image: "/breakfast.webp", bgColor: "#FCE4EC", accentColor: "#E91E63" },
  { id: 18, name: "Home Care", image: "/decore.webp", bgColor: "#F1F8E9", accentColor: "#7CB342" }
];

export const matchCategory = (itemCategory, selectedCategory) => {
  if (!itemCategory || !selectedCategory) return false;
  const dbCat = itemCategory.trim().toLowerCase();
  const uiCat = selectedCategory.trim().toLowerCase();
  return dbCat === uiCat || uiCat.includes(dbCat) || dbCat.includes(uiCat);
};
