// Регистрация нового пользователя
export async function registerUser(name, email, password) {
  // Получаем текущих пользователей из localStorage
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Проверяем, есть ли уже пользователь с таким email
  const exists = users.find(u => u.email === email);
  if (exists) {
    throw new Error("User already exists"); // если есть — выбрасываем ошибку
  }

  // Добавляем нового пользователя в массив
  users.push({ name, email, password });

  // Сохраняем обновленный список пользователей в localStorage
  localStorage.setItem("users", JSON.stringify(users));

  return { success: true };
}

// Логин пользователя
export async function loginUser(email, password) {
  // Получаем текущих пользователей из localStorage
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Ищем пользователя с совпадающим email и паролем
  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    throw new Error("Invalid email or password"); // если нет совпадения — выбрасываем ошибку
  }

  // Сохраняем текущего пользователя в localStorage
  localStorage.setItem(
    "currentUser",
    JSON.stringify({ name: user.name, email: user.email })
  );

  return { success: true, user };
}

