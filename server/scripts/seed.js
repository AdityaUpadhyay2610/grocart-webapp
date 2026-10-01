// server/scripts/seed.js
// Creates the first admin user and starter grocery categories.
// Run with: npm run seed (from the server/ directory)
//
// Safe to run twice — it skips records that already exist.

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../src/config/config');
const { query } = require('../src/config/db');

// ─── Validate seed credentials are present ──────────────────────────────────

const { name, email, password } = config.seedAdmin || {};

if (!name || !email || !password) {
  console.error('\n[seed] ERROR: SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, and SEED_ADMIN_PASSWORD');
  console.error('[seed]        must all be set in server/.env to run the seed script.\n');
  process.exit(1);
}

if (password.length < 8) {
  console.error('\n[seed] ERROR: SEED_ADMIN_PASSWORD must be at least 8 characters.\n');
  process.exit(1);
}

// ─── Starter categories ──────────────────────────────────────────────────────

const STARTER_CATEGORIES = [
  // Fresh Produce & Dairy
  { id: 'fresh-fruits',       name: 'Fresh Fruits',         slug: 'fresh-fruits',         description: 'Fresh fruits and seasonal produce',               image: '/fruits.webp' },
  { id: 'fresh-vegetables',   name: 'Fresh Vegetables',     slug: 'fresh-vegetables',     description: 'Farm-fresh vegetables and greens',                image: '/vegetables.webp' },
  { id: 'dairy',              name: 'Dairy',                slug: 'dairy',                description: 'Milk, cheese, butter, and eggs',                  image: '/dairy.webp' },
  { id: 'meat',               name: 'Meat',                 slug: 'meat',                 description: 'Fresh chicken, meat, and poultry',               image: 'https://cdn-icons-png.flaticon.com/512/1046/1046774.png' },
  { id: 'seafood',            name: 'Seafood',              slug: 'seafood',              description: 'Fresh seafood and fish',                          image: 'https://cdn-icons-png.flaticon.com/512/2347/2347311.png' },

  // Bakery, Snacks & Beverages
  { id: 'bread-biscuits',     name: 'Bread and Biscuits',   slug: 'bread-biscuits',       description: 'Breads, buns, and cookies',                       image: '/bread.webp' },
  { id: 'beverages',          name: 'Beverages',            slug: 'beverages',            description: 'Juices, water, tea, and coffee',                  image: '/beverages.webp' },
  { id: 'munchies',           name: 'Munchies',             slug: 'munchies',             description: 'Chips, crisps, and namkeen',                      image: '/munchies.webp' },
  { id: 'packed-food',        name: 'Packed Food',          slug: 'packed-food',          description: 'Packaged & instant food items',                   image: '/packaged.webp' },
  { id: 'chocolates',         name: 'Chocolates',           slug: 'chocolates',           description: 'Chocolates, candies, and sweets',                 image: '/chocolates.webp' },
  { id: 'sweet-tooth',        name: 'Sweet Tooth',          slug: 'sweet-tooth',          description: 'Sweets, desserts, and traditional treats',        image: '/sweet.webp' },
  { id: 'frozen-food',        name: 'Frozen Food',          slug: 'frozen-food',          description: 'Ready-to-cook meals, frozen snacks & ice cream',  image: '/deserts.webp' },
  { id: 'breakfast-cereals',  name: 'Breakfast & Cereals',  slug: 'breakfast-cereals',    description: 'Oats, muesli, flakes, and breakfast mixes',       image: '/breakfast.webp' },

  // Home, Hygiene & Cleaning
  { id: 'kitchen-essentials', name: 'Kitchen Essentials',   slug: 'kitchen-essentials',   description: 'Spices, oils, cookware & kitchen staples',        image: '/kitchen.webp' },
  { id: 'cleaning-essentials',name: 'Cleaning Essentials',  slug: 'cleaning-essentials',  description: 'Detergents, floor cleaners & disinfectants',      image: '/clean.webp' },
  { id: 'home-care',          name: 'Home Care',            slug: 'home-care',            description: 'Air fresheners, garbage bags & home essentials',  image: '/decore.webp' },
  { id: 'bath-body',          name: 'Bath and Body',        slug: 'bath-body',            description: 'Soaps, body washes, shampoos & skin care',        image: '/bathbody.jpg' },
  { id: 'pharmacy',           name: 'Pharmacy',             slug: 'pharmacy',             description: 'Over-the-counter medicine, wellness & hygiene',   image: '/pharmacy.webp' },
  { id: 'stationery',         name: 'Stationery',           slug: 'stationery',           description: 'Pens, notebooks, office and school supplies',      image: '/stationary.webp' },
  { id: 'pet-supplies',       name: 'Pet Supplies',         slug: 'pet-supplies',         description: 'Food and accessories for dogs, cats and pets',    image: '/pet_food.webp' },

  // Lifestyle, Fashion & Electronics
  { id: 'beauty',             name: 'Beauty',               slug: 'beauty',               description: 'Cosmetics, skincare & makeup essentials',         image: 'https://cdn-icons-png.flaticon.com/512/3120/3120531.png' },
  { id: 'fragrances',         name: 'Fragrances',           slug: 'fragrances',           description: 'Perfumes, body mists & deodorants',               image: 'https://cdn-icons-png.flaticon.com/512/3120/3120616.png' },
  { id: 'mens-clothing',      name: "Men's Clothing",       slug: 'mens-clothing',        description: "Apparel and daily wear for men",                  image: 'https://cdn-icons-png.flaticon.com/512/3050/3050229.png' },
  { id: 'womens-clothing',    name: "Women's Clothing",     slug: 'womens-clothing',      description: "Apparel and daily wear for women",                image: 'https://cdn-icons-png.flaticon.com/512/3050/3050244.png' },
  { id: 'electronics',        name: 'Electronics',          slug: 'electronics',          description: 'Cables, chargers, earphones & home electronics',  image: 'https://cdn-icons-png.flaticon.com/512/2777/2777142.png' },
  { id: 'jewelery',           name: 'Jewelery',             slug: 'jewelery',             description: 'Fashion jewelry and accessories',                 image: 'https://cdn-icons-png.flaticon.com/512/3081/3081648.png' },
  { id: 'furniture',          name: 'Furniture',            slug: 'furniture',            description: 'Home furniture and small organizers',             image: 'https://cdn-icons-png.flaticon.com/512/2635/2635445.png' }
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n[seed] Starting GroCart database seed...\n');

  let adminCreated = false;
  let categoriesCreated = 0;

  // 1. Create admin user (if not exists)
  try {
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);

    if (existing.rows.length > 0) {
      console.log(`[seed] Admin already exists: ${email} — skipping.`);
    } else {
      const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);
      const userId = crypto.randomUUID();
      const now = Date.now();

      await query(
        `INSERT INTO users
           (id, name, email, password_hash, role, store_name, phone_number,
            address, avatar_style, avatar_seed, avatar_url, email_verified, created_at)
         VALUES ($1, $2, $3, $4, 'admin', '', '', '', '', '', '', TRUE, $5)`,
        [userId, name, email.toLowerCase(), passwordHash, now]
      );

      console.log(`[seed] ✅ Admin created: ${email}`);
      adminCreated = true;
    }
  } catch (err) {
    console.error('[seed] ERROR creating admin:', err.message);
    process.exit(1);
  }

  // 2. Insert starter categories (skip existing ones)
  for (const cat of STARTER_CATEGORIES) {
    try {
      const result = await query(
        `INSERT INTO categories (id, name, slug, is_active, description, image)
         VALUES ($1, $2, $3, TRUE, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           slug = EXCLUDED.slug,
           description = EXCLUDED.description,
           image = EXCLUDED.image`,
        [cat.id, cat.name, cat.slug, cat.description, cat.image]
      );

      if (result.rowCount > 0) {
        console.log(`[seed] ✅ Category seeded/updated: ${cat.name}`);
        categoriesCreated++;
      }
    } catch (err) {
      console.error(`[seed] ERROR creating category "${cat.name}":`, err.message);
    }
  }

  // 3. Summary
  console.log('\n[seed] ─────────────────────────────────');
  console.log(`[seed] Admin created:      ${adminCreated ? 1 : 0}`);
  console.log(`[seed] Categories created: ${categoriesCreated}`);
  console.log('[seed] Seed complete. ✓\n');

  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Unexpected error:', err);
  process.exit(1);
});
