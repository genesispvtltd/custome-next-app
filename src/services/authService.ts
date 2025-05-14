// src/services/authService.ts

export async function login(username: string, password: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/Auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('Invalid username or password');
  }

  const data = await response.json();
  return data;
}
