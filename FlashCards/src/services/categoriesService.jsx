const API_BASE = "http://localhost:3000"; // Базовый URL для API
import { CATEGORIES as DEFAULT_CATEGORIES } from "../data/categories.jsx";

// Преобразование строки в "slug" для ID категорий
function slugify(text = "") {
  return String(text).trim().toLowerCase()
    .replace(/\s+/g, "-")          // заменяем пробелы на дефисы
    .replace(/[^a-z0-9-_]/g, "")   // удаляем недопустимые символы
    .replace(/-+/g, "-");          // убираем повторяющиеся дефисы
}

// Чтение категорий из localStorage
function readLocal() {
  try {
    const raw = localStorage.getItem("localCategories");
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_CATEGORIES.slice();
  } catch {
    return DEFAULT_CATEGORIES.slice();
  }
}

// Запись категорий в localStorage и уведомление об обновлении
function writeLocal(categories) {
  try {
    localStorage.setItem("localCategories", JSON.stringify(categories));

    // Генерируем кастомное событие для обновления UI
    window.dispatchEvent(new CustomEvent("localCategoriesUpdated", { detail: { ts: Date.now() } }));
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    console.warn("Failed to write localCategories", e);
  }
}

// Обработка ответа от сервера
async function handleResponse(res) {
  const text = await res.text().catch(() => "");
  let body = null;
  try { body = text ? JSON.parse(text) : null } catch { body = text; }

  if (!res.ok) {
    const err = new Error(body?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}

// Пробный fetch (можно расширить для retry, timeout и т.д.)
async function tryFetch(url, opts) {
  return fetch(url, opts);
}

// Получение всех категорий с сервера или localStorage
export async function getCategories() {
  try {
    const res = await tryFetch(`${API_BASE}/categories`);
    if (res.status === 404) return readLocal(); // если сервер недоступен, читаем локально
    const cats = await handleResponse(res);

    // Сохраняем серверную копию локально
    try { writeLocal(cats); } catch {}
    return cats;
  } catch (err) {
    return readLocal();
  }
}

// Получение категории по ID
export async function getCategoryById(id) {
  try {
    const res = await tryFetch(`${API_BASE}/categories/${encodeURIComponent(id)}`);
    if (res.status === 404) {
      const cats = await getCategories();
      return (cats || []).find(c => c.id === id) || null;
    }
    return await handleResponse(res);
  } catch (err) {
    const cats = readLocal();
    return (cats || []).find(c => c.id === id) || null;
  }
}

// Добавление новой категории
export async function addCategory({ title, color = "#ffd166", cards = [] }) {
  const id = slugify(title);
  let payload = { id, title, color, cards };

  try {
    // Отправка на сервер
    const res = await tryFetch(`${API_BASE}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const created = await handleResponse(res);

    // Обновление localStorage
    const local = readLocal();
    const exists = local.find(c => c.id === created.id);
    const next = exists ? local.map(c => c.id === created.id ? created : c) : [created, ...local];
    writeLocal(next);
    return created;
  } catch (err) {
    // Если сервер недоступен, создаем категорию локально
    const local = readLocal();
    if (local.find(c => c.id === payload.id)) {
      // Генерация уникального ID, если такой уже есть
      let i = 1;
      let newId;
      do {
        newId = `${payload.id}-${i++}`;
      } while (local.find(c => c.id === newId));
      payload.id = newId;
    }
    const next = [payload, ...local];
    writeLocal(next);
    return payload;
  }
}


export async function addCardToCategory(categoryId, cardData) {
  const generatedId = `card-${categoryId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  
  const newCard = {
    id: generatedId,
    label: cardData.label,
    imageUrl: cardData.imageUrl || cardData.image, // Поддержка обоих названий
    speak: cardData.speak || cardData.label
  };

  try {
    // Получаем категорию с сервера
    const catRes = await tryFetch(`${API_BASE}/categories/${encodeURIComponent(categoryId)}`);
    if (catRes.status === 404) throw new Error("Category not found");
    const cat = await handleResponse(catRes);

    const updatedCards = Array.isArray(cat.cards) ? [...cat.cards, newCard] : [newCard];

    // Отправляем обновленные карточки на сервер
    const res = await tryFetch(`${API_BASE}/categories/${encodeURIComponent(cat.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cards: updatedCards })
    });
    const updatedCat = await handleResponse(res);

    // Обновляем localStorage
    const local = readLocal();
    const exists = local.find(c => c.id === updatedCat.id);
    const next = exists ? local.map(c => c.id === updatedCat.id ? updatedCat : c) : [updatedCat, ...local];
    writeLocal(next);
    return updatedCat;
  } catch (err) {
    console.log("Server unavailable, saving locally:", err.message);
    // Если сервер недоступен, обновляем только локально
    const local = readLocal();
    const idx = local.findIndex(c => c.id === categoryId);
    if (idx === -1) throw new Error("Category not found (and network unavailable)");
    const cat = local[idx];
    const updatedCards = Array.isArray(cat.cards) ? [...cat.cards, newCard] : [newCard];
    const updatedCat = { ...cat, cards: updatedCards };
    const next = [...local];
    next[idx] = updatedCat;
    writeLocal(next);
    return updatedCat;
  }
}

// Поиск по карточкам и категориям
export async function searchCardsAndCategories(query) {
  if (!query || !query.trim()) return { cardResults: [], categoryResults: [] };
  const q = query.trim().toLowerCase();
  const cats = await getCategories(); 
  const cardResults = [];
  const categoryResults = [];

  for (const cat of (cats || [])) {
    // Проверяем совпадение с названием категории
    if ((cat.title || "").toLowerCase().includes(q)) {
      categoryResults.push({ id: cat.id, title: cat.title, color: cat.color });
    }
    // Проверяем совпадение с названием карточки
    (cat.cards || []).forEach((card, idx) => {
      if ((card.label || "").toLowerCase().includes(q)) {
        cardResults.push({ categoryId: cat.id, categoryTitle: cat.title, card, cardIndex: idx });
      }
    });
  }

  return { cardResults, categoryResults };
}

// Экспорт всех функций по умолчанию
export default {
  getCategories,
  getCategoryById,
  addCategory,
  addCardToCategory,
  searchCardsAndCategories
};
