// Mapping all variants (slugs, short names, display names) to their canonical category ID
const CANONICAL_CATEGORIES = {
  // Fresh Produce & Dairy
  'freshfruits': 'fresh-fruits',
  'fruit': 'fresh-fruits',
  'fruits': 'fresh-fruits',

  'freshvegetables': 'fresh-vegetables',
  'vegetable': 'fresh-vegetables',
  'vegetables': 'fresh-vegetables',

  'dairy': 'dairy',
  'dairyeggs': 'dairy',

  'meat': 'meat',
  'freshmeatpoultry': 'meat',

  'seafood': 'seafood',
  'freshseafoodfish': 'seafood',

  // Bakery, Snacks & Beverages
  'breadbiscuits': 'bread-biscuits',
  'breadandbiscuits': 'bread-biscuits',

  'beverages': 'beverages',
  'beveragesdrinks': 'beverages',

  'munchies': 'munchies',
  'munchiessnacks': 'munchies',

  'packedfood': 'packed-food',
  'packagedinstantfood': 'packed-food',

  'chocolates': 'chocolates',
  'chocolatescandies': 'chocolates',

  'sweettooth': 'sweet-tooth',
  'sweetsdesserts': 'sweet-tooth',

  'frozenfood': 'frozen-food',
  'frozenfoodicecream': 'frozen-food',

  'breakfastcereals': 'breakfast-cereals',

  // Home, Hygiene & Cleaning
  'kitchenessentials': 'kitchen-essentials',
  'kitchencookingessentials': 'kitchen-essentials',

  'cleaningessentials': 'cleaning-essentials',

  'homecare': 'home-care',
  'homecaredecor': 'home-care',

  'bathbody': 'bath-body',
  'bathandbody': 'bath-body',
  'bathbodycare': 'bath-body',

  'pharmacy': 'pharmacy',
  'pharmacywellness': 'pharmacy',

  'stationery': 'stationery',
  'stationeryoffice': 'stationery',

  'petsupplies': 'pet-supplies',
  'petsuppliesfood': 'pet-supplies',

  // Lifestyle, Fashion & Electronics
  'beauty': 'beauty',
  'beautycosmetics': 'beauty',

  'fragrances': 'fragrances',
  'fragrancesperfumes': 'fragrances',

  'mensclothing': 'mens-clothing',
  'mensclothingfashion': 'mens-clothing',

  'womensclothing': 'womens-clothing',
  'womensclothingfashion': 'womens-clothing',

  'electronics': 'electronics',
  'electronicsgadgets': 'electronics',

  'jewelery': 'jewelery',
  'jewelry': 'jewelery',
  'jewelryaccessories': 'jewelery',

  'furniture': 'furniture',
  'homefurniture': 'furniture',
};

const cleanStr = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export const getCanonicalCategory = (str) => {
  if (!str) return '';
  const cleaned = cleanStr(str);
  return CANONICAL_CATEGORIES[cleaned] || cleaned;
};

export const matchCategory = (itemCategory, selectedCategory) => {
  if (!itemCategory || !selectedCategory) return false;

  const canonItem = getCanonicalCategory(itemCategory);
  const canonSelected = getCanonicalCategory(selectedCategory);

  // Exact canonical match (e.g. "fresh-fruits" === "fresh-fruits")
  if (canonItem === canonSelected) return true;

  // Prevent Men's / Women's cross-matching
  const isMen = (s) => s.includes('men') && !s.includes('women');
  const isWomen = (s) => s.includes('women');
  if ((isMen(canonItem) && isWomen(canonSelected)) || (isWomen(canonItem) && isMen(canonSelected))) {
    return false;
  }

  // Fallback: exact cleaned string equality
  const c1 = cleanStr(itemCategory);
  const c2 = cleanStr(selectedCategory);
  return c1 === c2;
};
