// User authentication service

/**
 * Register a new user
 */
export async function registerUser(name, email, password) {
  try {
    // Get existing users from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
      throw new Error("Email already registered");
    }

    // Create new user
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password, // In production, this should be hashed!
      createdAt: new Date().toISOString()
    };

    // Save user
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    return { success: true, user: { id: newUser.id, name, email } };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

/**
 * Login user
 */
export async function loginUser(email, password) {
  try {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Save current user
    const currentUser = { id: user.id, name: user.name, email: user.email };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    localStorage.setItem("accessToken", `token-${Date.now()}`);

    return { success: true, user: currentUser };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Get current user
 */
export function getCurrentUser() {
  try {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

/**
 * Logout user
 */
export function logoutUser() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("accessToken");
}