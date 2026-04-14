import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "uploads";

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class StorageNotConfiguredError extends Error {
  constructor() {
    super("Storage not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.");
    this.name = "StorageNotConfiguredError";
    Object.setPrototypeOf(this, StorageNotConfiguredError.prototype);
  }
}

export class ObjectStorageService {
  private supabase: SupabaseClient | null = null;

  private getClient(): SupabaseClient {
    if (this.supabase) return this.supabase;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new StorageNotConfiguredError();
    }
    this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    return this.supabase;
  }

  async getUploadDetails(): Promise<{ uploadURL: string; objectPath: string }> {
    const client = this.getClient();
    const filePath = `screenshots/${randomUUID()}`;

    const { data, error } = await client.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .createSignedUploadUrl(filePath);

    if (error || !data) {
      throw new Error(`Failed to create signed upload URL: ${error?.message}`);
    }

    const { data: publicData } = client.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return {
      uploadURL: data.signedUrl,
      objectPath: publicData.publicUrl,
    };
  }

  async downloadByPublicUrl(publicUrl: string): Promise<Response> {
    const res = await fetch(publicUrl);
    if (!res.ok) throw new ObjectNotFoundError();
    return res;
  }
}
