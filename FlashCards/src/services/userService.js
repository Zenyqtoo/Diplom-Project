import {BASE_URL} from "./api";

export async function registerUser(name, email, password) {
    const response = await fetch(BASE_URL + "/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            email,
            password
        })
    });
    if (!response.ok) {
        throw new Error("Failed to register user");
    }
    return response.json();
}

export async function loginUser(email, password) {
    const response = await fetch(BASE_URL + "/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({  
            email,
            password
        })
    });
    if (!response.ok) {
        throw new Error("Failed to login user");

    }
    return response.json();
}   