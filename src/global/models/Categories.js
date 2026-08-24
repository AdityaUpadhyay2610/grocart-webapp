

export const matchCategory = (itemCategory, selectedCategory) => {
  if (!itemCategory || !selectedCategory) return false;
  const dbCat = itemCategory.trim().toLowerCase();
  const uiCat = selectedCategory.trim().toLowerCase();
  
  if (dbCat === uiCat) return true;

  // Prevent incorrect partial matches between Men's and Women's categories
  const isMen = (str) => str.includes("men") && !str.includes("women");
  const isWomen = (str) => str.includes("women");
  if ((isMen(dbCat) && isWomen(uiCat)) || (isWomen(dbCat) && isMen(uiCat))) {
    return false;
  }

  return uiCat.includes(dbCat) || dbCat.includes(uiCat);
};
