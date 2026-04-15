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
  isFeatured: boolean;
  entryPoints: number;
  whatYouGet: string | null;
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
  isFeatured?: boolean;
  entryPoints?: number;
  whatYouGet?: string | null;
}

export async function getPartners(): Promise<PartnerData[]> {
  const res = await fetch(`${API_BASE}/partners`, { cache: "no-store" });
  if (!res.ok) return [];
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

export async function generatePartnerAI(input: { url?: string; description?: string }) {
  const res = await authFetch("/partners/generate-ai", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "AI generation failed");
  }
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
  screenshotUrl?: string;
  agreedToTerms: boolean;
  isAnonymous?: boolean;
}

export async function getGiveawayStatus(): Promise<GiveawayStatus> {
  const res = await fetch(`${API_BASE}/giveaway/status`, { cache: "no-store" });
  return res.json();
}

export async function submitGiveawayEntry(data: GiveawayFormData): Promise<{ success: boolean; message: string; entryCode?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/giveaway/enter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) {
    return { success: false, message: "", error: result.error || "Failed to submit entry" };
  }
  return { success: true, message: result.message, entryCode: result.entry?.entryCode };
}

export async function requestUploadUrl(file: { name: string; size: number; contentType: string }): Promise<{ uploadURL: string; objectPath: string }> {
  const res = await fetch(`${API_BASE}/storage/uploads/request-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(file),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to get upload URL");
  }
  return res.json();
}

export async function uploadScreenshot(file: File): Promise<string> {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File size must not exceed 10 MB");
  }

  const { uploadURL, objectPath } = await requestUploadUrl({
    name: file.name,
    size: file.size,
    contentType: file.type,
  });

  const uploadRes = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload screenshot");
  }

  return objectPath;
}

export async function checkEntryCode(code: string): Promise<{ found: boolean; entry?: any; error?: string }> {
  const res = await fetch(`${API_BASE}/giveaway/check/${encodeURIComponent(code)}`);
  const result = await res.json();
  if (!res.ok) {
    return { found: false, error: result.error };
  }
  return result;
}

export interface ContestData {
  id: number;
  name: string;
  description: string;
  prize: string;
  prizeValue: string | null;
  maxSpots: number;
  status: string;
  imageUrl: string | null;
  slug: string;
  partnerIds: number[];
  createdAt: string;
  endsAt: string | null;
  totalEntries: number;
  spotsRemaining: number;
  isFull: boolean;
}

export async function getContests(): Promise<ContestData[]> {
  const res = await fetch(`${API_BASE}/contests`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function getContest(slug: string): Promise<ContestData | null> {
  const res = await fetch(`${API_BASE}/contests/${slug}`);
  if (!res.ok) return null;
  return res.json();
}

export async function createContest(data: Partial<ContestData>): Promise<ContestData> {
  const res = await authFetch("/contests", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateContest(id: number, data: Partial<ContestData>): Promise<ContestData> {
  const res = await authFetch(`/contests/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteContest(id: number): Promise<void> {
  await authFetch(`/contests/${id}`, { method: "DELETE" });
}

function getUserToken(): string | null {
  return localStorage.getItem("user_token");
}

function setUserToken(token: string): void {
  localStorage.setItem("user_token", token);
  window.dispatchEvent(new Event("user_auth_changed"));
}

function clearUserToken(): void {
  localStorage.removeItem("user_token");
  window.dispatchEvent(new Event("user_auth_changed"));
}

export async function registerUser(data: { fullName: string; email: string; phone?: string; password: string; city?: string }): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  const res = await fetch(`${API_BASE}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) return { success: false, error: result.error };
  setUserToken(result.token);
  return { success: true, token: result.token, user: result.user };
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  const res = await fetch(`${API_BASE}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const result = await res.json();
  if (!res.ok) return { success: false, error: result.error };
  setUserToken(result.token);
  return { success: true, token: result.token, user: result.user };
}

export async function getCurrentUser(): Promise<any | null> {
  const token = getUserToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getUserEntries(): Promise<any[]> {
  const token = getUserToken();
  if (!token) return [];
  try {
    const res = await fetch(`${API_BASE}/users/me/entries`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function logoutUser(): Promise<void> {
  const token = getUserToken();
  if (token) {
    fetch(`${API_BASE}/users/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  clearUserToken();
}

export function isUserLoggedIn(): boolean {
  return !!getUserToken();
}

export function getUserTokenValue(): string | null {
  return getUserToken();
}

export interface WinnerData {
  id: number;
  winnerName: string;
  winnerCity: string | null;
  prize: string;
  contestName: string;
  entryCode: string | null;
  announcedAt: string;
}

export async function getWinners(): Promise<WinnerData[]> {
  const res = await fetch(`${API_BASE}/winners`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function createWinner(data: { contestId?: number; entryId?: number; winnerName: string; winnerCity?: string; prize: string; entryCode?: string }): Promise<WinnerData> {
  const res = await authFetch("/admin/winners", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create winner");
  }
  return res.json();
}

export async function deleteWinner(id: number): Promise<void> {
  await authFetch(`/admin/winners/${id}`, { method: "DELETE" });
}

export interface EntryData {
  id: number;
  contestId: number | null;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  city: string;
  completedPartners: number[];
  partnerNames: string[];
  screenshotConfirmed: boolean;
  entryCount: number;
  entryCode: string;
  isAnonymous: boolean;
  createdAt: string;
}

export async function getAdminEntries(opts?: { limit?: number; offset?: number }): Promise<{ entries: EntryData[]; total: number }> {
  const params = new URLSearchParams();
  if (opts?.limit) params.set("limit", String(opts.limit));
  if (opts?.offset) params.set("offset", String(opts.offset));
  const res = await authFetch(`/admin/entries?${params.toString()}`);
  if (!res.ok) return { entries: [], total: 0 };
  return res.json();
}

export interface ActivityFeedItem {
  type: "entry" | "winner";
  name: string;
  city: string;
  contest: string;
  prize?: string;
  time: string;
}

export async function getActivityFeed(): Promise<ActivityFeedItem[]> {
  try {
    const res = await fetch(`${API_BASE}/activity/feed`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function generateContestAI(input: { theme?: string; prize?: string; description?: string }): Promise<{ name: string; slug: string; description: string; prize: string; prizeValue: string; maxSpots: number }> {
  const res = await authFetch("/contests/generate-ai", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "AI generation failed");
  }
  return res.json();
}
