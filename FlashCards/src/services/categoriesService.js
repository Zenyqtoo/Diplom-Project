const API_BASE = "http://localhost:3000";

async function handleResponse(res) {
  const text = await res.text().catch(() => "");
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) {
    const err = new Error(body?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

function slugify(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-");
}

/**
 * GET /categories
 * If resource is missing (404) or a network error occurs, return [] (frontend will fallback).
 */
export async function getCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (res.status === 404) return [];
    return await handleResponse(res);
  } catch (err) {
    console.warn("getCategories network error:", err);
    return [];
  }
}

/**
 * GET /categories/:id
 * Falls back to scanning the categories array if a 404 is returned.
 */
export async function getCategoryById(id) {
  try {
    const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}`);
    if (res.status === 404) {
      const cats = await getCategories();
      return (cats || []).find((c) => c.id === id) || null;
    }
    return await handleResponse(res);
  } catch (err) {
    console.warn("getCategoryById network error:", err);
    const cats = await getCategories();
    return (cats || []).find((c) => c.id === id) || null;
  }
}

/**
 * POST /categories
 * Creates a category using a slugified id derived from title.
 * If the server rejects (e.g. duplicate id), the error will propagate.
 */
export async function addCategory({ title, color = "#ffd166", cards = [] }) {
  const id = slugify(title);
  const payload = { id, title, color, cards };
  const res = await fetch(`${API_BASE}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
}

/**
 * Adds a card to a category by fetching the category and PATCHing its cards array.
 * Returns the updated category from the server.
 */
export async function addCardToCategory(categoryId, card) {
  const cat = await getCategoryById(categoryId);
  if (!cat) throw new Error("Category not found");
  const generatedId = `${categoryId}-${Date.now()}`;
  const newCard = { id: generatedId, ...card };
  const updatedCards = Array.isArray(cat.cards) ? [...cat.cards, newCard] : [newCard];
  const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(cat.id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cards: updatedCards })
  });
  return handleResponse(res);
}

/**
 * Client-side combined search over categories and their cards.
 * Returns { cardResults, categoryResults } where:
 * - cardResults: [{ categoryId, categoryTitle, card, cardIndex }]
 * - categoryResults: [{ id, title, color }]
 *
 * If categories cannot be fetched, returns empty arrays.
 */
export async function searchCardsAndCategories(query) {
  if (!query || !query.trim()) return { cardResults: [], categoryResults: [] };
  const q = query.trim().toLowerCase();
  const cats = await getCategories(); // safe: returns [] on error/404
  const cardResults = [];
  const categoryResults = [];

  for (const cat of (cats || [])) {
    if ((cat.title || "").toLowerCase().includes(q)) {
      categoryResults.push({ id: cat.id, title: cat.title, color: cat.color });
    }
    (cat.cards || []).forEach((card, idx) => {
      if ((card.label || "").toLowerCase().includes(q)) {
        cardResults.push({ categoryId: cat.id, categoryTitle: cat.title, card, cardIndex: idx });
      }
    });
  }

  return { cardResults, categoryResults };
}

/**
 * Backwards-compatible helpers
 */
export async function searchCardsByLabel(query) {
  const { cardResults } = await searchCardsAndCategories(query);
  return cardResults;
}

export async function searchCategoriesByTitle(query) {
  const { categoryResults } = await searchCardsAndCategories(query);
  return categoryResults;
}

export default {
  getCategories,
  getCategoryById,
  addCategory,
  addCardToCategory,
  searchCardsAndCategories,
  searchCardsByLabel,
  searchCategoriesByTitle
};