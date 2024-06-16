import axios from "axios";
import { showToast, Toast, getPreferenceValues } from "@raycast/api";

export interface Url {
  shortCode: string;
  shortUrl: string;
  longUrl: string;
  deviceLongUrls: { android: string | null; ios: string | null; desktop: string | null };
  dateCreated: string;
  tags: string[];
  meta: { validSince: string | null; validUntil: string | null; maxVisits: number | null };
  domain: string | null;
  title: string | null;
  crawlable: boolean;
  forwardQuery: boolean;
  visitsSummary: { total: number; nonBots: number; bots: number };
  visitsCount: number;
}

interface Preferences {
  apiKey: string;
  apiUrl: string;
}

export function getApiConfig() {
  const preferences = getPreferenceValues<Preferences>();
  return {
    apiUrl: preferences.apiUrl,
    apiKey: preferences.apiKey,
  };
}

const { apiUrl, apiKey } = getApiConfig();
const headers = {
  'Content-Type': 'application/json',
  'X-Api-Key': apiKey
};

export async function fetchUrls(): Promise<Url[]> {
  try {
    const url = `${apiUrl}/rest/v3/short-urls`;
    const response = await axios.get(url, { headers });
    return response.data.shortUrls.data;
  } catch (error) {
    console.error("Error fetching URLs:", error);
    throw error;
  }
}

export async function deleteUrl(shortCode: string): Promise<void> {
  try {
    await axios.delete(`${apiUrl}/rest/v3/short-urls/${shortCode}`, { headers });
    await showToast(Toast.Style.Success, "Deleted", "The URL has been deleted successfully");
  } catch (error) {
    console.error("Error deleting URL:", error);
    await showToast(Toast.Style.Failure, "Error", "Failed to delete the URL");
    throw error;
  }
}

export async function createShortUrl(longUrl: string, customSlug?: string | undefined, tags?: string[]): Promise<string> {
  try {
    const url = `${apiUrl}/rest/v3/short-urls`;
    const data = {
      longUrl,
      customSlug: customSlug || undefined,
      tags: tags || undefined
    };
    const response = await axios.post(url, data, { headers });
    return response.data.shortUrl;
  } catch (error) {
    console.error("Error creating short URL:", error);
    throw error;
  }
}

export async function fetchUrlByShortCode(shortCode: string): Promise<Url> {
  try {
    const url = `${apiUrl}/rest/v3/short-urls/${shortCode}`;
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching URL:", error);
    throw error;
  }
}

export async function getTags(): Promise<string[]> {
  try {
    const url = `${apiUrl}/rest/v3/tags`;
    const response = await axios.get(url, { headers });
    return response.data.tags.data;
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }
}
