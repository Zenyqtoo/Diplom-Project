import { BASE_URL } from "./api";

/**
 * Register user
 */
export async function registerUser(name, email, password) {
  const cleanEmail = email.trim().toLowerCase(); // normalize email

  // check if email exists
  const checkResponse = await fetch(`${BASE_URL}/users?email=${cleanEmail}`);
  const existingUsers = await checkResponse.json();

  if (existingUsers.length > 0) {
    throw new Error("Email already registered");
  }

  // create user
  const response = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name,
      email: cleanEmail, // save normalized email
      password,
      createdAt: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error("Failed to register user");
  }

  const user = await response.json();

  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}


/**
 * Login user
 */
export async function loginUser(email, password) {
  const cleanEmail = email.trim().toLowerCase(); // normalize email

  const response = await fetch(`${BASE_URL}/users?email=${cleanEmail}`);
  const users = await response.json();

  if (users.length === 0) {
    throw new Error("User not found");
  }

  const user = users[0];

  if (user.password !== password) {
    throw new Error("Invalid password");
  }

  const currentUser = {
    id: user.id,
    name: user.name,
    email: user.email
  };

  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  localStorage.setItem("accessToken", `token-${user.id}-${Date.now()}`);

  return { success: true, user: currentUser };
}

