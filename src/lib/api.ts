const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Definición robusta para JSON, evitando `any`
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Tipos mínimos para respuestas de autenticación del backend
export type BackendUser = {
  id?: string;
  firebase_uid?: string;
  email?: string;
  name?: string;
  user_type?: 'constructora' | 'residente' | string;
};

export type AuthLoginResponse = {
  idToken?: string;
  token?: string;
  user?: BackendUser;
};

function getToken(): string | null {
  try {
    return localStorage.getItem('idToken');
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null) {
  try {
    if (token) localStorage.setItem('idToken', token);
    else localStorage.removeItem('idToken');
  } catch {
    // No-op si el almacenamiento falla (modo privado, etc.)
    return;
  }
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, {
    headers,
    ...options,
  });
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    const message = typeof data === 'string' ? data : data?.error || 'Error de API';
    throw new Error(message);
  }
  return data;
}

export async function syncAuthUser(firebaseUid: string): Promise<{ user_id: string }> {
  return request('/api/auth/sync', { method: 'POST', body: JSON.stringify({ firebase_uid: firebaseUid }) });
}

export async function createConstructora(payload: Json) {
  return request('/api/constructoras', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getConstructoraByUser(userId: string) {
  return request(`/api/constructoras/by-user/${userId}`);
}

export async function getConstructora(id: string) {
  return request(`/api/constructoras/${id}`);
}

export async function listPlans() {
  return request('/api/plans');
}

// Gastos de obra
export async function listGastosObra(filters?: { obra_id?: string; residente_id?: string }) {
  const params = new URLSearchParams();
  if (filters?.obra_id) params.set('obra_id', filters.obra_id);
  if (filters?.residente_id) params.set('residente_id', filters.residente_id);
  return request(`/api/gastos-obra?${params.toString()}`);
}

export async function getGastoObra(id: string) {
  return request(`/api/gastos-obra/${id}`);
}

export async function createGastoObra(payload: Json) {
  return request('/api/gastos-obra', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateGastoObra(id: string, payload: Json) {
  return request(`/api/gastos-obra/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteGastoObra(id: string) {
  return request(`/api/gastos-obra/${id}`, { method: 'DELETE' });
}

// Residentes
export async function getResidente(id: string) {
  return request(`/api/residentes/${id}`);
}

export async function listResidentes(filters?: { constructora_id?: string }) {
  const params = new URLSearchParams();
  if (filters?.constructora_id) params.set('constructora_id', filters.constructora_id);
  return request(`/api/residentes?${params.toString()}`);
}

export async function createResidente(payload: Json) {
  return request('/api/residentes/register', { method: 'POST', body: JSON.stringify(payload) });
}

export async function deleteResidente(id: string) {
  return request(`/api/residentes/${id}`, { method: 'DELETE' });
}

// Obras
export async function getObraByResidente(residenteId: string) {
  return request(`/api/obras/by-residente/${residenteId}`);
}

export async function listObras(filters?: { constructora_id?: string }) {
  const params = new URLSearchParams();
  if (filters?.constructora_id) params.set('constructora_id', filters.constructora_id);
  return request(`/api/obras?${params.toString()}`);
}

export async function deleteObra(id: string) {
  return request(`/api/obras/${id}`, { method: 'DELETE' });
}

export async function createObra(payload: Json) {
  return request('/api/obras', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateObra(id: string, payload: Json) {
  return request(`/api/obras/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

// Asignaciones de obra (para responsable)
export async function listAsignacionesObra(filters?: { obra_id?: string; residente_id?: string }) {
  const params = new URLSearchParams();
  if (filters?.obra_id) params.set('obra_id', filters.obra_id);
  if (filters?.residente_id) params.set('residente_id', filters.residente_id);
  return request(`/api/asignaciones_obra?${params.toString()}`);
}

export async function createAsignacionObra(payload: Json) {
  return request('/api/asignaciones_obra', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateAsignacionObra(id: string, payload: Json) {
  return request(`/api/asignaciones_obra/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

// Reportes
export async function listReports(filters?: { residente_id?: string; obra_id?: string }) {
  const params = new URLSearchParams();
  if (filters?.residente_id) params.set('residente_id', filters.residente_id);
  if (filters?.obra_id) params.set('obra_id', filters.obra_id);
  return request(`/api/reports?${params.toString()}`);
}

// Pagos
export async function listPagos(filters?: { constructora_id?: string }) {
  const params = new URLSearchParams();
  if (filters?.constructora_id) params.set('constructora_id', filters.constructora_id);
  return request(`/api/pagos?${params.toString()}`);
}

// Autenticación
export async function login(email: string, password: string): Promise<AuthLoginResponse>
{
  const resp = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  // Guarda idToken para futuras llamadas autenticadas
  if (resp?.idToken) setAuthToken(resp.idToken);
  return resp;
}

export async function registerConstructora(payload: { email: string; password: string; companyName: string; telefono?: string }): Promise<AuthLoginResponse> {
  const { email, password, companyName, telefono } = payload;
  const resp = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      userType: 'constructora',
      userData: {
        nombre_empresa: companyName,
        email,
        telefono,
        subscription_status: 'trial',
        subscription_start_date: new Date().toISOString(),
        is_active: true,
      },
    }),
  });
  // Si devuelve idToken (no obligatorio en registro), podríamos guardarlo
  if (resp?.idToken) setAuthToken(resp.idToken);
  return resp;
}