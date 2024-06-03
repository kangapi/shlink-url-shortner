import { ActionPanel, Action, Color, List, showToast, Toast, Icon, getPreferenceValues } from "@raycast/api";
import axios from "axios";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

// Define the type for the URL object
interface Url {
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

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();
  const apiKey = preferences.apiKey;
  const apiURL = preferences.apiUrl;

  const [urls, setUrls] = useState<Url[]>([]); // Type the state with the Url type

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const url = `${apiURL}/rest/v3/short-urls`;
        const headers = {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey
        };
        const response = await axios.get(url, { headers });
        setUrls(response.data.shortUrls.data);
      } catch (error) {
        console.error("Error fetching URLs:", error);
      }
    };

    fetchUrls();
  }, []);

  const deleteUrl = async (shortCode: string) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      };
      await axios.delete(`${apiURL}/rest/v3/short-urls/${shortCode}`, { headers });
      setUrls((prevUrls) => prevUrls.filter((url) => url.shortCode !== shortCode));
      await showToast(Toast.Style.Success, "Deleted", "The URL has been deleted successfully");
    } catch (error) {
      console.error("Error deleting URL:", error);
      await showToast(Toast.Style.Failure, "Error", "Failed to delete the URL");
    }
  };

  return (
    <List isLoading={urls.length === 0}>
      <List.Section title="Shortened URLs" subtitle={`${urls.length}`}>
        {urls.map((url) => (
          <List.Item
            key={url.shortUrl} // Ensure each item has a unique key
            title={"/" + url.shortCode}
            subtitle={url.longUrl}
            accessories={[
              {
                date: new Date(url.dateCreated),
                tooltip: `${formatDistanceToNow(new Date(url.dateCreated))} ago`
              },
              {
                tag: { value: `${url.visitsCount}`, color: Color.SecondaryText },
                tooltip: "Number of visits"
              },
            ]}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard content={url.shortUrl} title="Copy Short URL" />
                <Action.OpenInBrowser url={url.longUrl} title="Open Long URL" />
                <Action
                  title="Delete URL"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  shortcut={{ modifiers: ["shift"], key: "delete"}}
                  onAction={() => deleteUrl(url.shortCode)}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
