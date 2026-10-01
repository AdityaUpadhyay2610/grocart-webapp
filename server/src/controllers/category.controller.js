// server/src/controllers/category.controller.js
// Handles categories retrieval (public) and creation/update (admin).
// The frontend uses snapshot fetches and polling (subscribeToCategories -> setInterval).

const { query } = require('../config/db');
const { formatCategory } = require('../utils/formatters');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/categories — public, returns all active categories
const getCategories = asyncHandler(async (req, res) => {
  const result = await query(
    'SELECT * FROM categories WHERE is_active = TRUE ORDER BY name ASC',
    []
  );
  const categories = result.rows.map(formatCategory);
  return sendSuccess(res, categories);
});

// POST /api/admin/categories — admin only, create or update a category by id
const saveCategory = asyncHandler(async (req, res) => {
  const { id, name, description = '', image = '', isActive = true } = req.body;
  const categoryId = id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const sql = `
    INSERT INTO categories (id, name, slug, is_active, description, image)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      is_active = EXCLUDED.is_active,
      description = EXCLUDED.description,
      image = EXCLUDED.image
    RETURNING *;
  `;
  const result = await query(sql, [categoryId, name, slug, isActive, description, image]);
  return sendSuccess(res, formatCategory(result.rows[0]), 200);
});

module.exports = {
  getCategories,
  saveCategory
};
