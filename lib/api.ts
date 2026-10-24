const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('hcm_token');
};

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('hcm_token', token);
  }
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('hcm_token');
    localStorage.removeItem('hcm_user');
  }
};

export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('hcm_user');
  return user ? JSON.parse(user) : null;
};

export const setStoredUser = (user: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('hcm_user', JSON.stringify(user));
  }
};

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; message?: string; [key: string]: any }> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401 && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        removeToken();
        window.location.href = '/login';
      }
      throw new Error(data.message || `API error ${res.status}`);
    }

    return data;
  } catch (error: any) {
    throw error;
  }
}

