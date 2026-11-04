// Map of category slugs/IDs to their display names for reverse lookup
const SLUG_TO_NAME = {
  'fresh-fruits': 'Fresh Fruits',
  'fresh-vegetables': 'Fresh Vegetables',
  'dairy': 'Dairy',
  'meat': 'Meat',
  'seafood': 'Seafood',
  'bread-biscuits': 'Bread and Biscuits',
  'beverages': 'Beverages',
  'munchies': 'Munchies',
  'packed-food': 'Packed Food',
  'chocolates': 'Chocolates',
  'sweet-tooth': 'Sweet Tooth',
  'frozen-food': 'Frozen Food',
  'breakfast-cereals': 'Breakfast & Cereals',
  'kitchen-essentials': 'Kitchen Essentials',
  'cleaning-essentials': 'Cleaning Essentials',
  'home-care': 'Home Care',
  'bath-body': 'Bath and Body',
  'pharmacy': 'Pharmacy',
  'stationery': 'Stationery',
  'pet-supplies': 'Pet Supplies',
  'beauty': 'Beauty',
  'fragrances': 'Fragrances',
  'mens-clothing': "Men's Clothing",
  'womens-clothing': "Women's Clothing",
  'electronics': 'Electronics',
  'jewelery': 'Jewelery',
  'furniture': 'Furniture',
};

export const matchCategory = (itemCategory, selectedCategory) => {
  if (!itemCategory || !selectedCategory) return false;

  const dbCat = String(itemCategory).trim().toLowerCase();
  const uiCat = String(selectedCategory).trim().toLowerCase();

  if (dbCat === uiCat) return true;

  // Resolve slug to name so "fresh-fruits" matches "Fresh Fruits"
  const resolvedDb = (SLUG_TO_NAME[dbCat] || dbCat).toLowerCase();
  const resolvedUi = (SLUG_TO_NAME[uiCat] || uiCat).toLowerCase();
  if (resolvedDb === resolvedUi) return true;

  // Prevent swapping men's and women's
  const isMen = (s) => s.includes('men') && !s.includes('women');
  const isWomen = (s) => s.includes('women');
  if ((isMen(resolvedDb) && isWomen(resolvedUi)) || (isWomen(resolvedDb) && isMen(resolvedUi))) {
    return false;
  }

  // Normalize separators and compare
  const norm = (s) => s.replace(/[-_&/]/g, ' ').replace(/\s+/g, ' ').trim();
  const nDb = norm(resolvedDb);
  const nUi = norm(resolvedUi);

  if (nDb === nUi) return true;
  if (nUi.includes(nDb) || nDb.includes(nUi)) return true;

  // Word overlap for multi-word categories
  const dbWords = nDb.split(' ').filter(w => w.length > 3);
  const uiWords = nUi.split(' ').filter(w => w.length > 3);
  return dbWords.some(w => uiWords.includes(w));
};
