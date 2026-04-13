const API_BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("admin_token");
}

function setToken(token: string): void {
  localStorage.setItem("admin_token", token);
}

function clearToken(): void {
  localStorage.removeItem("admin_token");
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(`${API_BASE}${url}`, { ...options, headers });
}

export async function login(username: string, password: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  setToken(data.token);
  return true;
}

export async function verifySession(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;
  try {
    const res = await fetch(`${API_BASE}/admin/verify`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

export async function logout(): Promise<void> {
  await authFetch("/admin/logout", { method: "POST" }).catch(() => {});
  clearToken();
}

export interface PartnerData {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  registrationUrl: string;
  accent: string;
  badge: string | null;
  badgeSecondary: string | null;
  isActive: boolean;
  isRequired: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  stats: { clicks: number; impressions: number; formFills: number };
}

export interface PartnerInput {
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  category?: string;
  registrationUrl: string;
  accent?: string;
  badge?: string | null;
  badgeSecondary?: string | null;
  isActive?: boolean;
  isRequired?: boolean;
}

export async function getPartners(): Promise<PartnerData[]> {
  const res = await fetch(`${API_BASE}/partners`);
  return res.json();
}

export async function getPartner(slug: string): Promise<PartnerData | null> {
  const res = await fetch(`${API_BASE}/partners/${slug}`);
  if (!res.ok) return null;
  return res.json();
}

export async function getAnalytics() {
  const res = await authFetch("/admin/analytics");
  return res.json();
}

export async function createPartner(data: PartnerInput) {
  const res = await authFetch("/partners", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updatePartner(id: number, data: Partial<PartnerInput>) {
  const res = await authFetch(`/partners/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deletePartner(id: number) {
  const res = await authFetch(`/partners/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function trackClick(partnerId: number) {
  fetch(`${API_BASE}/partners/${partnerId}/click`, { method: "POST" }).catch(() => {});
}

export async function trackImpression(partnerId: number) {
  fetch(`${API_BASE}/partners/${partnerId}/impression`, { method: "POST" }).catch(() => {});
}

export async function trackFormFill(partnerId: number) {
  fetch(`${API_BASE}/partners/${partnerId}/form-fill`, { method: "POST" }).catch(() => {});
}

export interface GiveawayStatus {
  totalEntries: number;
  maxSpots: number;
  spotsRemaining: number;
  isFull: boolean;
  announcementDate: string;
}

export interface GiveawayFormData {
  fullName: string;
  email: string;
  phone: string;
  age: number;
  city: string;
  completedPartners: number[];
  screenshotConfirmed: boolean;
  agreedToTerms: boolean;
}

export async function getGiveawayStatus(): Promise<GiveawayStatus> {
  const res = await fetch(`${API_BASE}/giveaway/status`);
  return res.json();
}

export async function submitGiveawayEntry(data: GiveawayFormData): Promise<{ success: boolean; message: string; error?: string }> {
  const res = await fetch(`${API_BASE}/giveaway/enter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) {
    return { success: false, message: "", error: result.error || "Failed to submit entry" };
  }
  return { success: true, message: result.message };
}
